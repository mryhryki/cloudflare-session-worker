import { discovery } from "openid-client";
import { getSessionPaths } from "./constants";
import { oidcCallbackHandler } from "./handlers/odic_callback";
import { oidcRequestHandler } from "./handlers/odic_request";
import { createSessionStore } from "./lib/session/create.ts";
import { getSessionStore } from "./lib/session/get.ts";
import type {
  InitSessionHandlerArgs,
  OnRequestWithAuth,
} from "./types/session_handler.ts";
import { forceSameOrigin } from "./util/url.ts";

export const requireAuth = async (
  handler: OnRequestWithAuth,
  args: InitSessionHandlerArgs,
): Promise<Response> => {
  const {
    cloudflare: { req, kv },
    oidc: { clientId, clientSecret, baseUrl },
  } = args;
  const paths = getSessionPaths();

  const sessionStore = await getSessionStore(kv, req);
  const session = await sessionStore?.get();

  // TODO: Move
  const oidcConfiguration = await discovery(
    new URL(baseUrl),
    clientId,
    clientSecret,
  );

  const { pathname } = new URL(req.url);
  switch (pathname) {
    case paths.login: {
      if (session != null) {
        // TODO: Get redirect path from session and arguments
        const pathname = session?.loginContext?.returnTo ?? "/";
        const redirectUrl = forceSameOrigin(pathname, req);
        return new Response(`Redirect to: ${redirectUrl.toString()}`, {
          status: 307,
          headers: {
            Location: redirectUrl.toString(),
            "Content-Type": "text/plain",
          },
        });
      }
      const newSession = await createSessionStore(kv, req);
      return await oidcRequestHandler(req, {
        callbackPath: paths.callback,
        openIdClientConfiguration: oidcConfiguration,
        session: newSession,
      });
    }
    case paths.callback: {
      if (sessionStore == null) {
        return new Response("Session ID not found", { status: 400 });
      }
      return await oidcCallbackHandler(req, {
        openIdClientConfiguration: oidcConfiguration,
        sessionStore,
      });
    }
    case paths.logout:
      return new Response("TODO: Logout");
  }

  if (sessionStore == null || session == null || session?.user == null) {
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
