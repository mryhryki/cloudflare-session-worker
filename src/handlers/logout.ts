import type { KVNamespace } from "@cloudflare/workers-types";
import { oidcLogoutHandler } from "../lib/oidc/odic_logout.ts";
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

const getDefaultErrorResponse = (
  returnTo: string,
  requestUrl: string,
): Response => {
  return new Response(null, {
    status: 307,
    headers: {
      Location: forceSameOrigin(returnTo, requestUrl),
      "Content-Type": "text/plan",
    },
  });
};

export const logoutHandler = async (
  args: LoginHandlerArgs,
): Promise<Response> => {
  const {
    req,
    config,
    kv,
    oidcParams: { clientId, clientSecret, baseUrl, postLogoutRedirectUri },
  } = args;

  const sessionId = getSessionId(req, config.cookieName);
  if (typeof sessionId !== "string") {
    return getDefaultErrorResponse(config.fallbackPath, req.url);
  }

  const sessionStore = await getSessionStore({
    config,
    useSecureCookie: !isInLocalDevelopment(req),
    kv,
    sessionId,
  });
  const session = await sessionStore.get();
  if (session?.status !== "logged-in") {
    return getDefaultErrorResponse(config.fallbackPath, req.url);
  }

  const response = await oidcLogoutHandler({
    clientId,
    clientSecret,
    baseUrl,
    postLogoutRedirectUri,
    idToken: session.idToken,
  });
  await sessionStore.delete(response);
  return response;
};
