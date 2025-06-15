import type { KVNamespace } from "@cloudflare/workers-types";
import { oidcCallbackHandler } from "../lib/oidc/odic_callback.ts";
import { getSessionId } from "../lib/session_store/cookie/get.ts";
import { getSessionStore } from "../lib/session_store/get.ts";
import type { OidcParams, SessionConfiguration } from "../types.ts";
import { isInLocalDevelopment } from "../util/request.ts";

interface CallbackHandlerArgs {
  config: SessionConfiguration;
  kv: KVNamespace;
  oidcParams: OidcParams;
  req: Request;
}

const getDefaultErrorResponse = () =>
  new Response("Invalid Status", {
    status: 400,
    headers: {
      "Content-Type": "text/plain",
    },
  });

export const callbackHandler = async (
  args: CallbackHandlerArgs,
): Promise<Response> => {
  const {
    req,
    config,
    kv,
    oidcParams: { clientId, clientSecret, baseUrl },
  } = args;

  const sessionId = getSessionId(req, config.cookieName);
  if (typeof sessionId !== "string") {
    return getDefaultErrorResponse();
  }

  const sessionStore = await getSessionStore({
    config,
    useSecureCookie: !isInLocalDevelopment(req),
    kv,
    sessionId,
  });
  const session = await sessionStore.get();
  if (session?.status !== "not-logged-in") {
    return getDefaultErrorResponse();
  }

  const { response, values } = await oidcCallbackHandler(req, {
    clientId,
    clientSecret,
    baseUrl,
    pkceCodeVerifier: session.loginContext.pkceCodeVerifier,
    returnTo: session.loginContext.returnTo ?? "/",
  });
  if (values != null) {
    const { idToken, user } = values;
    await sessionStore.put({ status: "logged-in", idToken, user }, response);
  }
  return response;
};
