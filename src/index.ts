import { getSessionPaths } from "./constants";
import { oidcCallbackHandler } from "./handlers/odic_callback";
import { oidcRequestHandler } from "./handlers/odic_request";
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
  } = params;
  const config = getSessionConfiguration(params.session ?? {});
  const paths = getSessionPaths();

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

  const requestUrl = new URL(req.url);
  const { pathname } = requestUrl;

  switch (pathname) {
    case paths.login: {
      const session = await sessionStore?.get();
      if (session?.status !== "logged-in") {
        const redirectUrl = forceSameOrigin(
          requestUrl.searchParams.get("returnTo") ??
            session?.loginContext?.returnTo ??
            "/",
          requestUrl.origin,
        );
        return new Response(`Redirect to: ${redirectUrl.toString()}`, {
          status: 307,
          headers: {
            Location: redirectUrl.toString(),
            "Content-Type": "text/plain",
          },
        });
      }
      const newSession = await createSessionStore({
        config,
        useSecureCookie: !isInLocalDevelopment(req),
        kv,
      });
      return await oidcRequestHandler(req, {
        callbackPath: paths.callback,
        oidcParams: params.oidc,
        session: newSession,
      });
    }
    case paths.callback:
      if (sessionStore == null) {
        return new Response("Session ID not found", { status: 400 });
      }
      return await oidcCallbackHandler(req, {
        oidcParams: params.oidc,
        sessionStore,
      });
    case paths.logout:
      return new Response("TODO: Logout");
  }

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
