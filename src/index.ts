import { getSessionPaths } from "./constants";
import { callbackHandler } from "./handlers/callback.ts";
import { LoginHandler, loginHandler } from "./handlers/login.ts";
import { oidcCallbackHandler } from "./lib/oidc/odic_callback.ts";
import { oidcRequestHandler } from "./lib/oidc/odic_request.ts";
import { getSessionConfiguration } from "./lib/session_store/config/session_config.ts";
import { getSessionId } from "./lib/session_store/cookie/get.ts";
import { createSessionStore } from "./lib/session_store/create.ts";
import { getSessionStore } from "./lib/session_store/get.ts";
import type { InitSessionHandlerParams, OnRequestWithAuth } from "./types.ts";
import { isInLocalDevelopment } from "./util/request.ts";
import { forceSameOrigin } from "./util/url.ts";

export const requireAuth = async (
  handler: OnRequestWithAuth,
  params: InitSessionHandlerParams,
): Promise<Response> => {
  const {
    cloudflare: { req, kv },
    oidc: oidcParams,
  } = params;
  const config = getSessionConfiguration(params.session ?? {});
  const paths = getSessionPaths();

  const requestUrl = new URL(req.url);
  const { pathname } = requestUrl;

  switch (pathname) {
    case paths.login:
      return await loginHandler({ config, kv, oidcParams, paths, req });
    case paths.callback:
      return await callbackHandler({ config, kv, oidcParams, req });
    case paths.logout:
      return new Response("TODO: Logout");
  }

  const sessionId = getSessionId(req, config.cookieName);
  const sessionStore =
    typeof sessionId === "string"
      ? await getSessionStore({
          config,
          useSecureCookie: !isInLocalDevelopment(req),
          kv,
          sessionId,
        })
      : null;

  const session = await sessionStore?.get();
  if (
    sessionStore == null ||
    session == null ||
    session?.status !== "logged-in"
  ) {
    const loginUrl = new URL(paths.login, req.url);
    const { pathname: returnTo } = new URL(req.url);
    loginUrl.searchParams.set("returnTo", returnTo);

    return new Response(`Redirect to: ${loginUrl.toString()}`, {
      status: 307,
      headers: {
        Location: loginUrl.toString(),
        "Content-Type": "text/plain",
      },
    });
  }

  const response = await handler(session.user);
  await sessionStore.put(session, response);
  return response;
};
