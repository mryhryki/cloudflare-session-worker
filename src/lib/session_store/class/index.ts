import type { KVNamespace } from "@cloudflare/workers-types";
import type {
  SessionConfiguration,
  SessionStoreGetFunction,
  SessionStoreInterface,
  SessionStorePutFunction,
} from "../../../types/session.ts";
import { isInLocalDevelopment } from "../../../util/request.ts";
import { toDate } from "../../../util/time.ts";
import { setSessionCookie } from "../cookie/set.ts";
import { generateGetRecordFunction } from "./common/get_record.ts";
import { generatePutRecordFunction } from "./common/put_record.ts";
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
