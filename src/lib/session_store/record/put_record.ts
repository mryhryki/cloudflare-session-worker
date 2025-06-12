import type { KVNamespace } from "@cloudflare/workers-types";
import type {
  SessionConfiguration,
  SessionData,
  SessionRecord,
} from "../../../types/session.ts";
import { isValidSessionId } from "../../../util/session_id.ts";
import { getUnixSec } from "../../../util/time.ts";
import { validateSessionRecord } from "./validate.ts";

interface GeneratePutRecordArgs {
  kv: KVNamespace;
  config: SessionConfiguration;
}

interface PutRecordFunctionArgs {
  sessionId: string;
  sessionData: SessionData;
  sessionRecord: SessionRecord | null;
}

export type PutRecordFunction = (
  args: PutRecordFunctionArgs,
) => Promise<SessionRecord>;

export const generatePutRecordFunction = (
  args: GeneratePutRecordArgs,
): PutRecordFunction => {
  const { kv, config } = args;

  return async (args: PutRecordFunctionArgs): Promise<SessionRecord> => {
    const { sessionId, sessionRecord, sessionData } = args;
    if (!isValidSessionId(sessionId)) {
      throw new Error("Internal Error: Invalid session ID");
    }

    const nowUnixSec = getUnixSec();
    const absolute: number =
      sessionRecord?.expiration?.absolute ?? nowUnixSec + config.maxLifetimeSec;
    const idle: number = nowUnixSec + config.idleLifetimeSec;

    const record = validateSessionRecord({
      data: sessionData,
      expiration: { absolute, idle },
    });
    if (record == null) {
      throw new Error("Internal Error: Invalid session record");
    }

    await kv.put(sessionId, JSON.stringify(record), {
      expiration: Math.min(absolute, idle),
    });
    return record;
  };
};
