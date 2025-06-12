import type { SessionRecord } from "../../../types/session.ts";
import { isAfter } from "../../../util/time.ts";

export const validateSessionRecord = (
  sessionRecord: unknown,
): SessionRecord | null => {
  // TODO: Validate
  const record = sessionRecord as SessionRecord;
  const isLive = isAfter(
    Math.min(record.expiration.absolute, record.expiration.idle),
    new Date(),
  );
  return isLive ? record : null;
};
