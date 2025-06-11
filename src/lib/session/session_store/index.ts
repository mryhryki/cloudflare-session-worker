import type { KVNamespace } from "@cloudflare/workers-types";
import type {
  SessionConfiguration,
  SessionStoreGetFunction,
  SessionStoreInterface,
  SessionStorePutFunction,
} from "../../../types/session.ts";
import { isInLocalDevelopment } from "../../../util/request.ts";
import { getUnixSec, toDate } from "../../../util/time.ts";
import { setSessionCookie } from "../cookie/set.ts";
import { generateGetRecordFunction } from "./common/get_record.ts";
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

  const getRecord = generateGetRecordFunction(kv);

  const getSession: SessionStoreGetFunction = async () => {
    return (await getRecord(sessionId))?.data ?? null;
  };

  const putSession: SessionStorePutFunction = async (data, res) => {
    const nowUnixSec = getUnixSec();
    const absolute: number =
      (await getRecord(sessionId))?.expiration?.absolute ??
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
