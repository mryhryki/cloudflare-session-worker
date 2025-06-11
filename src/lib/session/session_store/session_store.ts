import type { KVNamespace } from "@cloudflare/workers-types";
import type {
  SessionConfiguration,
  SessionRecord,
  SessionStoreDeleteFunction,
  SessionStoreGetFunction,
  SessionStoreInterface,
  SessionStorePutFunction,
} from "../../../types/session.ts";
import { isInLocalDevelopment } from "../../../util/request.ts";
import { getUnixSec, isAfter, toDate } from "../../../util/time.ts";
import { deleteSessionCookie } from "../cookie/delete.ts";
import { setSessionCookie } from "../cookie/set.ts";

interface GenerateSessionStoreArgs {
  sessionId: string;
  kv: KVNamespace;
  req: Request;
  config: SessionConfiguration;
}

const isLiveRecord = (record: SessionRecord): boolean =>
  isAfter(Math.min(record.expiration.absolute, record.expiration.idle));

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
    // TODO: Validate
    return isLiveRecord(cachedRecord) ? cachedRecord : null;
  };

  const get: SessionStoreGetFunction = async () => {
    return (await getRecord())?.data ?? null;
  };

  const put: SessionStorePutFunction = async (data, res) => {
    const nowUnixSec = getUnixSec();
    const absolute: number =
      (await getRecord())?.expiration?.absolute ??
      nowUnixSec + config.maxLifetimeSec;
    const idle: number = nowUnixSec + config.idleLifetimeSec;
    const record: SessionRecord = {
      data,
      expiration: { absolute, idle },
    };
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

  const deleteFunc: SessionStoreDeleteFunction = async (
    res: Response,
  ): Promise<void> => {
    await kv.delete(sessionId);
    deleteSessionCookie(res, {
      sessionId,
      secure: isSecure,
    });
  };

  return { get, put, delete: deleteFunc };
};
