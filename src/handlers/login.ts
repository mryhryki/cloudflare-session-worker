import type { KVNamespace } from "@cloudflare/workers-types";
import { oidcRequestHandler } from "../lib/oidc/odic_request.ts";
import { getSessionId } from "../lib/session_store/cookie/get.ts";
import { createSessionStore } from "../lib/session_store/create.ts";
import { getSessionStore } from "../lib/session_store/get.ts";
import type {
  OidcParams,
  SessionConfiguration,
  SessionPaths,
} from "../types.ts";
import { isInLocalDevelopment } from "../util/request.ts";

interface LoginHandlerArgs {
  config: SessionConfiguration;
  kv: KVNamespace;
  oidcParams: OidcParams;
  paths: SessionPaths;
  req: Request;
}

export const loginHandler = async (
  args: LoginHandlerArgs,
): Promise<Response> => {
  const { req, config, kv, paths, oidcParams } = args;

  const sessionId = getSessionId(req, config.cookieName);
  if (typeof sessionId === "string") {
    const sessionStore = await getSessionStore({
      config,
      useSecureCookie: !isInLocalDevelopment(req),
      kv,
      sessionId,
    });

    const session = await sessionStore.get();
    if (session?.status === "logged-in") {
      // TODO: Redirect to returnTo or home page
      return new Response("Already logged in");
    }
  }

  const newSession = await createSessionStore({
    config,
    useSecureCookie: !isInLocalDevelopment(req),
    kv,
  });

  return await oidcRequestHandler(req, {
    callbackPath: paths.callback,
    oidcParams,
    session: newSession,
  });
};
