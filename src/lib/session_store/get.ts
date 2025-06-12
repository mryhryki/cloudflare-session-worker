import type {
  GetSessionStore,
  SessionStoreGetFunction,
  SessionStorePutFunction,
} from "../../types/session.ts";
import { toDate } from "../../util/time.ts";
import { deleteSessionCookie } from "./cookie/delete.ts";
import { setSessionCookie } from "./cookie/set.ts";
import { generateGetRecordFunction } from "./record/get_record.ts";
import { generatePutRecordFunction } from "./record/put_record.ts";

export const getSessionStore: GetSessionStore = async (args) => {
  const { kv, sessionId, useSecureCookie, config } = args;

  const getRecord = generateGetRecordFunction({ kv });
  const putRecord = generatePutRecordFunction({ kv, config });

  const getSession: SessionStoreGetFunction = async () => {
    return (await getRecord(sessionId))?.data ?? null;
  };

  const putSession: SessionStorePutFunction = async (sessionData, res) => {
    const sessionRecord = await getRecord(sessionId);
    const savedRecord = await putRecord({
      sessionId,
      sessionData,
      sessionRecord,
    });
    const { absolute, idle } = savedRecord.expiration;
    setSessionCookie(res, {
      cookieName: config.cookieName,
      sessionId,
      secure: useSecureCookie,
      expires: toDate(Math.min(absolute, idle)),
    });
  };

  const deleteSession = async (res: Response): Promise<void> => {
    await kv.delete(sessionId);
    deleteSessionCookie(res, {
      cookieName: config.cookieName,
      sessionId,
      secure: useSecureCookie,
    });
  };

  return {
    get: getSession,
    put: putSession,
    delete: deleteSession,
  };
};
