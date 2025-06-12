import { type SerializeOptions, parse, serialize } from "cookie";
import { BaseSerializeOptions } from "./common.ts";

interface SetSessionCookieArgs {
  cookieName: string;
  expires: Date;
  secure: boolean;
  sessionId: string;
}

export const setSessionCookie = (
  res: Response,
  args: SetSessionCookieArgs,
): void => {
  const { cookieName, sessionId, secure, expires } = args;
  const cookieValue = serialize(cookieName, sessionId, {
    ...BaseSerializeOptions,
    expires,
    secure,
  });
  res.headers.append("Set-Cookie", cookieValue);
};
