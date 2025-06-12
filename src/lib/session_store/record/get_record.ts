import type { KVNamespace } from "@cloudflare/workers-types";
import type { SessionRecord } from "../../../types/session.ts";
import { isValidSessionId } from "../../../util/session_id.ts";
import { validateSessionRecord } from "./validate.ts";

interface GetRecordFunctionArgs {
  kv: KVNamespace;
}

export type GetRecordFunction = (
  sessionId: string,
) => Promise<SessionRecord | null>;

export const generateGetRecordFunction = (
  args: GetRecordFunctionArgs,
): GetRecordFunction => {
  const { kv } = args;

  return async (sessionId: string): Promise<SessionRecord | null> => {
    if (!isValidSessionId(sessionId)) {
      return null;
    }
    const record = await kv.get<unknown>(sessionId, "json");
    if (record == null) {
      return null;
    }
    return validateSessionRecord(record);
  };
};
