import { serialize } from "cookie";
import { BaseSerializeOptions } from "./common.ts";

interface DeleteSessionCookieArgs {
  cookieName: string;
  sessionId: string;
  secure: boolean;
}

export const deleteSessionCookie = (
  res: Response,
  args: DeleteSessionCookieArgs,
): void => {
  const { cookieName, sessionId, secure } = args;
  const cookieValue = serialize(cookieName, sessionId, {
    ...BaseSerializeOptions,
    maxAge: 0,
    secure,
  });
  res.headers.append("Set-Cookie", cookieValue);
};
