import { type SerializeOptions, parse, serialize } from "cookie";
import { BaseSerializeOptions, DefaultCookieName } from "./common.ts";

interface SetSessionCookieArgs {
  cookieName?: string;
  sessionId: string;
  secure: boolean;
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
