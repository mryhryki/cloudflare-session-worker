import { parse } from "cookie";
import { expect } from "vitest";
import { isValidSessionId } from "../../../util/session_id.ts";
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

  if (isValidSessionId(sessionId)) {
    return sessionId;
  }

  return null;
};
