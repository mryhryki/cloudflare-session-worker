import type { KVNamespace } from "@cloudflare/workers-types";
import { oidcCallbackHandler } from "../lib/oidc/odic_callback.ts";
import { getSessionId } from "../lib/session_store/cookie/get.ts";
import { getSessionStore } from "../lib/session_store/get.ts";
import type {
  OidcParams,
  SessionConfiguration,
  SessionPaths,
} from "../types.ts";
import { isInLocalDevelopment } from "../util/request.ts";

interface CallbackHandlerArgs {
  config: SessionConfiguration;
  kv: KVNamespace;
  oidcParams: OidcParams;
  req: Request;
}

export const callbackHandler = async (
  args: CallbackHandlerArgs,
): Promise<Response> => {
  const { req, config, kv, oidcParams } = args;

  const sessionId = getSessionId(req, config.cookieName);
  if (typeof sessionId === "string") {
    const sessionStore = await getSessionStore({
      config,
      useSecureCookie: !isInLocalDevelopment(req),
      kv,
      sessionId,
    });

    return await oidcCallbackHandler(req, {
      oidcParams,
      sessionStore,
    });
  }

  return new Response("Session ID not found", { status: 400 });
};
