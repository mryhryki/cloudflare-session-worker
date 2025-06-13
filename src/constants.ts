import type { SessionPaths } from "./types.ts";

const CommonPathPrefix = "/session";

export const getSessionPaths = (prefix = CommonPathPrefix): SessionPaths => ({
  callback: `${prefix}/callback`,
  login: `${prefix}/login`,
  logout: `${prefix}/logout`,
});
