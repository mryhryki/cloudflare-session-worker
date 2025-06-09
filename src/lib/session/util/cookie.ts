import { type SerializeOptions, parse, serialize } from "cookie";

const DefaultCookieName = "session";

export const getSessionId = (
  request: Request,
  cookieName: string = DefaultCookieName,
): string | null => {
  const cookieValue: string = request.headers.get("Cookie") ?? "";
  const cookies = parse(cookieValue);
  return cookies[cookieName] ?? null;
};

const BaseSerializeOptions: SerializeOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
};

interface BaseArgs {
  cookieName?: string;
  sessionId: string;
  secure: boolean;
}

interface SetSessionCookieArgs extends BaseArgs {
  expires: Date;
}

export const setSessionCookie = (
  res: Response,
  args: SetSessionCookieArgs,
): void => {
  const { cookieName = DefaultCookieName, sessionId, secure, expires } = args;
  const cookieValue = serialize(cookieName, sessionId, {
    ...BaseSerializeOptions,
    expires,
    secure,
  });
  res.headers.append("Set-Cookie", cookieValue);
};

interface DeleteSessionCookieArgs extends BaseArgs {}

export const deleteSessionCookie = (
  res: Response,
  args: DeleteSessionCookieArgs,
): void => {
  const { cookieName = DefaultCookieName, sessionId, secure } = args;
  const cookieValue = serialize(cookieName, sessionId, {
    ...BaseSerializeOptions,
    maxAge: 0,
    secure,
  });
  res.headers.append("Set-Cookie", cookieValue);
};
