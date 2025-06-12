import { isAfter } from "../../../util/time.ts";
import { SessionRecordSchema } from "./schema.ts";
import type { SessionRecord } from "./types.ts";

export const validateSessionRecord = (
  sessionRecord: unknown,
): SessionRecord | null => {
  // TODO: Validate
  const result = SessionRecordSchema.safeParse(sessionRecord);
  if (!result.success) {
    return null;
  }

  const record: SessionRecord = result.data;
  const isLive = isAfter(
    Math.min(record.expiration.absolute, record.expiration.idle),
    new Date(),
  );
  return isLive ? record : null;
};
