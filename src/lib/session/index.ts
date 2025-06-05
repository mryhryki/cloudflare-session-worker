import { parse, serialize } from "cookie";
import { generateRandomHex } from "../random.ts";
import type { SessionData, SessionInterface, SessionRecord } from "./types.ts";

interface SessionConfiguration {
  maxLifetimeSec: number;
  idleLifetimeSec: number;
}

export interface CloudflareKV {
  get<T>(key: string, type: "json"): Promise<T | null>;
  put(
    key: string,
    value: string,
    options: { expiration?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

export class Session implements SessionInterface {
  private static cookieName = "session";

  private static configuration: SessionConfiguration = {
    maxLifetimeSec: 7 * 86400, // 7 days
    idleLifetimeSec: 3 * 86400, // 3 days
  };

  static create(kv: CloudflareKV): Session {
    return new Session(kv, generateRandomHex(256));
  }

  static continue(kv: CloudflareKV, request: Request): Session | null {
    try {
      const cookieValue: string = request.headers.get("Cookie") ?? "";
      const sessionId: string =
        parse(cookieValue)[Session.cookieName] ?? "(none)";
      return new Session(kv, sessionId);
    } catch {
      return null;
    }
  }

  #sessionId: string;
  #kv: CloudflareKV;
  #record: SessionRecord | null = null;

  private constructor(kv: CloudflareKV, sessionId: string) {
    this.#sessionId = this.#validateSessionId(sessionId);
    this.#kv = kv;
  }

  get id(): string {
    return this.#sessionId;
  }

  async get(): Promise<SessionRecord | null> {
    if (this.#record != null && this.#isLive(this.#record)) {
      return this.#record;
    }

    const record = await this.#kv.get<SessionRecord>(this.#sessionId, "json");
    if (record == null || !this.#isLive(record)) {
      return null;
    }

    // TODO: Validate the record

    this.#record = record;
    return record;
  }

  async put(data: SessionData): Promise<void> {
    const nowUnixSec = this.#getNowUnixSec();
    const absolute: number =
      (await this.get())?.expiration?.absolute ??
      nowUnixSec + Session.configuration.maxLifetimeSec;
    const idle: number = nowUnixSec + Session.configuration.idleLifetimeSec;
    const record: SessionRecord = {
      data,
      expiration: { absolute, idle },
    };
    await this.#kv.put(this.#sessionId, JSON.stringify(record), {
      expiration: Math.min(absolute, idle),
    });
  }

  async delete(): Promise<void> {
    await this.#kv.delete(this.#sessionId);
  }

  async generateCookieValue(secure: boolean): Promise<string> {
    const record = await this.get();
    const expiresUnixSec =
      record == null
        ? this.#getNowUnixSec() + Session.configuration.maxLifetimeSec
        : Math.min(record.expiration.absolute, record.expiration.idle);
    const expires = new Date();
    expires.setTime(expiresUnixSec * 1000);

    return serialize(Session.cookieName, this.#sessionId, {
      httpOnly: true,
      expires,
      path: "/",
      sameSite: "lax",
      secure,
    });
  }

  #validateSessionId(value: unknown): string {
    if (typeof value === "string" && /^[0-9a-f]{64,}$/.test(value)) {
      return value;
    }
    throw new Error(`Invalid session ID: ${JSON.stringify(value)}`);
  }

  #getNowUnixSec(): number {
    return Math.floor(Date.now() / 1000);
  }

  #isLive(record: SessionRecord): boolean {
    const nowUnixSec = this.#getNowUnixSec();
    const expiration = Math.min(
      record.expiration.absolute,
      record.expiration.idle,
    );
    return nowUnixSec < expiration;
  }
}
