import type { KVNamespace } from "@cloudflare/workers-types";
import type { UserInfoByIdToken } from "./user_info.ts";

export interface SessionData {
  loginContext: {
    pkceVerifier: string;
    returnTo?: string | null | undefined;
  } | null;
  user: UserInfoByIdToken | null;
}

export interface SessionExpiration {
  absolute: number;
  idle: number;
}

export interface SessionRecord {
  data: SessionData;
  expiration: SessionExpiration;
}

export type SessionStoreGetFunction = () => Promise<SessionData | null>;
export type SessionStorePutFunction = (
  data: SessionData,
  res: Response,
) => Promise<void>;
export type SessionStoreDeleteFunction = (res: Response) => Promise<void>;

export interface SessionStoreInterface {
  get: SessionStoreGetFunction;
  put: SessionStorePutFunction;
  delete: SessionStoreDeleteFunction;
}

interface GetSessionStoreArgs {
  config: SessionConfiguration;
  useSecureCookie: boolean;
  kv: KVNamespace;
  sessionId: string;
}

export type GetSessionStore = (
  args: GetSessionStoreArgs,
) => Promise<SessionStoreInterface>;

interface CreateSessionStoreArgs {
  config: SessionConfiguration;
  useSecureCookie: boolean;
  kv: KVNamespace;
}

export type CreateSessionStore = (
  args: CreateSessionStoreArgs,
) => Promise<SessionStoreInterface>;

export interface SessionConfiguration {
  cookieName: string;
  maxLifetimeSec: number;
  idleLifetimeSec: number;
}
