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
import { forceSameOrigin } from "../util/url.ts";

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
  const {
    req,
    config,
    kv,
    paths,
    oidcParams: { clientId, clientSecret, baseUrl },
  } = args;

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
      const location = forceSameOrigin(config.fallbackPath, req.url);
      return new Response(`Redirect to: ${location}`, {
        status: 307,
        headers: { Location: location },
      });
    }
  }

  const newSessionStore = await createSessionStore({
    config,
    useSecureCookie: !isInLocalDevelopment(req),
    kv,
  });

  const { response, values } = await oidcRequestHandler({
    requestUrl: req.url,
    callbackPath: paths.callback,
    clientId,
    clientSecret,
    baseUrl,
  });

  if (values != null) {
    const { pkceCodeVerifier } = values;
    await newSessionStore.put(
      {
        status: "not-logged-in",
        loginContext: {
          pkceCodeVerifier,
          returnTo: new URL(req.url).searchParams.get("returnTo") ?? null,
        },
      },
      response,
    );
  }

  return response;
};
