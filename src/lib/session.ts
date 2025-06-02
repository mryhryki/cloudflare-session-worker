import { parse, serialize } from "cookie";
import { generateRandomHex } from './random'

interface SessionConfiguration {
  maxLifetimeSec: number;
  idleLifetimeSec: number;
}

interface SessionData {
  pkceVerifier: string | null;
}

export interface CloudflareKV {
  get<T>(key: string, type: "json"): Promise<T | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export class Session {
  private static cookieName = "session";

  private static configuration: SessionConfiguration = {
    maxLifetimeSec: 7 * 86400, // 7 days
    idleLifetimeSec: 3 * 86400, // 3 days
  };

  static create(kv: CloudflareKV): Session {
    const sessionId = generateRandomHex(256);
    return new Session(kv, sessionId);
  }

  static continue(kv: CloudflareKV, request: Request): Session {
    const sessionId = parse(request.headers.get("Cookie") ?? '')[Session.cookieName];
    if (typeof sessionId !== "string") {
      throw new Error("Session ID not found in request cookies");
    }
    Session.#validateSessionId(sessionId);
    return new Session(kv, sessionId);
  }

  #sessionId: string;
  #kv: CloudflareKV;

  private constructor(kv: CloudflareKV, sessionId: string) {
    Session.#validateSessionId(sessionId);
    this.#sessionId = sessionId;
    this.#kv = kv;
  }

  get id(): string {
    return this.#sessionId;
  }

  async get(): Promise<SessionData | null> {
    // TODO: Check expiration
    return await this.#kv.get<SessionData>(this.#sessionId, "json");
  }

  async put(data: SessionData): Promise<void> {
    // TODO: Add expiration
    await this.#kv.put(this.#sessionId, JSON.stringify(data));
  }

  async delete(): Promise<void> {
    await this.#kv.delete(this.#sessionId);
  }

  generateCookieValue(): string {
    return serialize(Session.cookieName, this.#sessionId, {
      httpOnly: true,
      maxAge: Session.configuration.maxLifetimeSec,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  }

  static #validateSessionId(sessionId: string): void {
    if (/^[0-9a-f]{64,}$/.test(sessionId)) return;
    throw new Error(`Invalid session ID: ${sessionId}`);
  }
}
