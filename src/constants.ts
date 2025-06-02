const CommonPathPrefix = "/session";

export const getSessionPaths = (prefix = CommonPathPrefix) =>
  ({
    callback: `${prefix}/callback`,
    login: `${prefix}/login`,
    logout: `${prefix}/logout`,
  }) as const;
