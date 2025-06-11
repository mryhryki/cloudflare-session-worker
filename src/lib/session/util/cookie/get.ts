import { parse } from "cookie";
import { expect } from "vitest";
import { DefaultCookieName } from "./common.ts";

export const getSessionId = (
  request: Request,
  cookieName: string = DefaultCookieName,
): string | null => {
  const cookieValue: string = request.headers.get("Cookie") ?? "";
  const cookies = parse(cookieValue);
  const sessionId = cookies[cookieName];

  if (typeof sessionId !== "string") {
    return null;
  }

  if (/^[0-9a-f]{64,}$/.test(sessionId)) {
    return sessionId;
  }

  return null;
};
