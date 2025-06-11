import type { KVNamespace } from "@cloudflare/workers-types";
import type {
  SessionConfiguration,
  SessionRecord,
  SessionStoreGetFunction,
  SessionStoreInterface,
  SessionStorePutFunction,
} from "../../../types/session.ts";
import { isInLocalDevelopment } from "../../../util/request.ts";
import { getUnixSec, toDate } from "../../../util/time.ts";
import { setSessionCookie } from "../cookie/set.ts";
import { validateSessionRecord } from "./common/validate.ts";
import { generateDeleteSessionFunction } from "./delete.ts";

interface GenerateSessionStoreArgs {
  cookieName?: string;
  sessionId: string;
  kv: KVNamespace;
  req: Request;
  config: SessionConfiguration;
}

export const generateSessionStore = async (
  args: GenerateSessionStoreArgs,
): Promise<SessionStoreInterface> => {
  const { sessionId, kv, req, config } = args;
  const isSecure = !isInLocalDevelopment(req);

  let cachedRecord: SessionRecord | null = null;
  const getRecord = async (): Promise<SessionRecord | null> => {
    if (cachedRecord == null) {
      cachedRecord = await kv.get<SessionRecord>(sessionId, "json");
      if (cachedRecord == null) {
        return null;
      }
    }
    return validateSessionRecord(cachedRecord);
  };

  const getSession: SessionStoreGetFunction = async () => {
    return (await getRecord())?.data ?? null;
  };

  const putSession: SessionStorePutFunction = async (data, res) => {
    const nowUnixSec = getUnixSec();
    const absolute: number =
      (await getRecord())?.expiration?.absolute ??
      nowUnixSec + config.maxLifetimeSec;
    const idle: number = nowUnixSec + config.idleLifetimeSec;
    const record = validateSessionRecord({
      data,
      expiration: { absolute, idle },
    });
    if (record == null) {
      throw new Error("Internal Error: Invalid session record");
    }
    await kv.put(sessionId, JSON.stringify(record), {
      expiration: Math.min(absolute, idle),
    });
    cachedRecord = record;
    setSessionCookie(res, {
      sessionId,
      secure: isSecure,
      expires: toDate(Math.min(absolute, idle)),
    });
  };

  return {
    get: getSession,
    put: putSession,
    delete: generateDeleteSessionFunction({ sessionId, kv, req }),
  };
};
