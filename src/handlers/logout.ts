import type { KVNamespace } from "@cloudflare/workers-types";
import { getOidcConfiguration } from "../lib/oidc/configucation.ts";
import { getSessionId } from "../lib/session_store/cookie/get.ts";
import { getSessionStore } from "../lib/session_store/get.ts";
import type { OidcParams, SessionConfiguration } from "../types.ts";
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

  const defaultReturnTo = forceSameOrigin(config.defaultReturnTo, req.url);
  const defaultResponse = new Response(`Redirect to ${defaultReturnTo}`, {
    status: 307,
    headers: { Location: defaultReturnTo, "Content-Type": "text/plan" },
  });

  const sessionId = getSessionId(req, config.cookieName);
  if (typeof sessionId !== "string") {
    return defaultResponse;
  }

  const sessionStore = await getSessionStore({
    config,
    useSecureCookie: !isInLocalDevelopment(req),
    kv,
    sessionId,
  });
  const session = await sessionStore.get();
  if (session?.status !== "logged-in") {
    return defaultResponse;
  }

  const oidcConfiguration = await getOidcConfiguration(oidcParams);
  const { end_session_endpoint } = oidcConfiguration.serverMetadata();
  if (typeof end_session_endpoint !== "string") {
    return defaultResponse;
  }

  const url = new URL(end_session_endpoint);
  url.searchParams.set("id_token_hint", session.idToken);
  const redirectTo = url.href;

  const response = new Response(`Redirect to: ${redirectTo}`, {
    status: 307,
    headers: { Location: redirectTo },
  });
  await sessionStore.delete(response);
  return response;
};
