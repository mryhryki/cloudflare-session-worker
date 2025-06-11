import type { KVNamespace } from "@cloudflare/workers-types";
import type { SessionStoreDeleteFunction } from "../../../types/session.ts";
import { isInLocalDevelopment } from "../../../util/request.ts";
import { deleteSessionCookie } from "../cookie/delete.ts";

type GenerateDeleteSessionFunctionArgs = {
  cookieName?: string;
  sessionId: string;
  kv: KVNamespace;
  req: Request;
};

export const generateDeleteSessionFunction = (
  args: GenerateDeleteSessionFunctionArgs,
): SessionStoreDeleteFunction => {
  const { cookieName, sessionId, kv, req } = args;
  const secure: boolean = !isInLocalDevelopment(req);

  return async (res: Response): Promise<void> => {
    await kv.delete(sessionId);
    deleteSessionCookie(res, { cookieName, sessionId, secure });
  };
};
