import type { KVNamespace } from "@cloudflare/workers-types";
import { getOidcConfiguration } from "../lib/oidc/configucation.ts";
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
import { forceSameOrigin } from "../util/url.ts";

interface LoginHandlerArgs {
  config: SessionConfiguration;
  kv: KVNamespace;
  oidcParams: OidcParams;
  req: Request;
}

export const logoutHandler = async (
  args: LoginHandlerArgs,
): Promise<Response> => {
  const { req, config, kv, oidcParams } = args;

  const oidcConfiguration = await getOidcConfiguration(oidcParams);
  const { end_session_endpoint: endSessionEndpoint } =
    oidcConfiguration.serverMetadata();
  const redirectTo =
    endSessionEndpoint ?? forceSameOrigin(config.defaultReturnTo, req.url);

  const response = new Response(`Redirect to: ${redirectTo}`, {
    status: 307,
    headers: { Location: redirectTo },
  });

  const sessionId = getSessionId(req, config.cookieName);
  if (typeof sessionId === "string") {
    const sessionStore = await getSessionStore({
      config,
      useSecureCookie: !isInLocalDevelopment(req),
      kv,
      sessionId,
    });
    await sessionStore.delete(response);
  }

  return response;
};
