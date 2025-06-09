import type { KVNamespace } from "@cloudflare/workers-types";
import type { UserInfoByIdToken } from "./user_info.ts";

export interface SessionData {
  loginContext: {
    pkceVerifier: string;
    returnTo?: string | null | undefined;
  } | null;
  user: UserInfoByIdToken | null;
}

// For internal use only
export interface SessionRecord {
  data: SessionData;
  expiration: {
    absolute: number;
    idle: number;
  };
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

export type CreateSessionStore = (
  kv: KVNamespace,
  req: Request,
  config?: Partial<SessionConfiguration>,
) => Promise<SessionStoreInterface>;

export type GetSessionStore = (
  kv: KVNamespace,
  req: Request,
  config?: Partial<SessionConfiguration>,
) => Promise<SessionStoreInterface | null>;

export interface SessionConfiguration {
  maxLifetimeSec: number;
  idleLifetimeSec: number;
}
