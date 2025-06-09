import { parse, serialize } from "cookie";

const DefaultCookieName = "session";

export const getSessionId = (
  request: Request,
  cookieName: string = DefaultCookieName,
): string | null => {
  const cookieValue: string = request.headers.get("Cookie") ?? "";
  const cookies = parse(cookieValue);
  return cookies[cookieName] ?? null;
};

interface SetSessionCookieArgs {
  cookieName?: string;
  sessionId: string;
  secure: boolean;
  expires: Date;
}

export const setSessionCookie = (
  response: Response,
  args: SetSessionCookieArgs,
): Response => {
  const { cookieName = DefaultCookieName, sessionId, secure, expires } = args;
  const cookieValue = serialize(cookieName, sessionId, {
    httpOnly: true,
    expires,
    path: "/",
    sameSite: "lax",
    secure,
  });
  response.headers.append("Set-Cookie", cookieValue);
  return response;
};
