export interface SessionData {
  loginContext: {
    pkceVerifier: string;
    returnTo?: string | null | undefined;
  } | null;
  user: Record<string, unknown> | null;
}

export interface SessionRecord {
  data: SessionData;
  expiration: {
    absolute: number;
    idle: number;
  };
}

export type getSessionStore = (
  req: Request,
) => Promise<SessionStoreInterface | null>;

export interface SessionStoreInterface {
  get(): Promise<SessionRecord | null>;
  put(data: SessionData): Promise<void>;
  delete(): Promise<void>;
}
