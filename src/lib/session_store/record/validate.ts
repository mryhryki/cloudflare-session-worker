import type { SessionRecord } from "../../../types.ts";
import { isAfter } from "../../../util/time.ts";
import { SessionRecordSchema } from "./schema.ts";

export const validateSessionRecord = (
  sessionRecord: unknown,
  baseDate: Date,
): SessionRecord | null => {
  const result = SessionRecordSchema.safeParse(sessionRecord);
  if (!result.success) {
    return null;
  }

  const record: SessionRecord = result.data;
  const isLive = isAfter(
    Math.min(record.expiration.absolute, record.expiration.idle),
    baseDate,
  );
  return isLive ? record : null;
};
