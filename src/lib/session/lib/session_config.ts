import type { SessionConfiguration } from "../../../types/session";

const DefaultSessionConfiguration: SessionConfiguration = {
  maxLifetimeSec: 7 * 86400, // 7 days
  idleLifetimeSec: 86400, // 1 day
};

export const getSessionConfiguration = (
  partialSessionConfiguration?: Partial<SessionConfiguration>,
): SessionConfiguration => {
  return {
    ...DefaultSessionConfiguration,
    ...(partialSessionConfiguration ?? {}),
  };
};
