import { parse } from "cookie";
import { DefaultCookieName } from "./common.ts";

export const getSessionId = (
  request: Request,
  cookieName: string = DefaultCookieName,
): string | null => {
  const cookieValue: string = request.headers.get("Cookie") ?? "";
  const cookies = parse(cookieValue);
  return cookies[cookieName] ?? null;
};
