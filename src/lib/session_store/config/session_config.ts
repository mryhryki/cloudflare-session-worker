import type { SessionConfiguration } from "../../../types.ts";

const DefaultSessionConfiguration: SessionConfiguration = {
  fallbackPath: "/",
  cookieName: "session",
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
