import { parse } from "cookie";
import { isValidSessionId } from "../../../util/session_id.ts";

export const getSessionId = (
  request: Request,
  cookieName: string,
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
