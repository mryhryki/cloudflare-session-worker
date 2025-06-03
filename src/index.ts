import { discovery } from "openid-client";
import { getSessionPaths } from "./constants";
import { oidcCallbackHandler } from "./handlers/odic_callback";
import { oidcRequestHandler } from "./handlers/odic_request";
import { type CloudflareKV, Session } from "./lib/session";

export type SessionHandler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
) => Promise<Response>;

export interface InitSessionHandlerArgs {
  cloudflare: {
    kv: CloudflareKV;
  };
  oidc: {
    clientId: string;
    clientSecret: string;
    // e.g.
    // - Amazon Cognito: https://cognito-idp.{region}.amazonaws.com/{region}_{random}
    baseUrl: string;
  };
  secret: {
    signingKey: string;
  };
  onRequestWithValidSession: (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    user: Record<string, unknown>,
  ) => Promise<Response>;
}

export const initSessionHandler = async (
  args: InitSessionHandlerArgs,
): Promise<SessionHandler> => {
  const {
    cloudflare: { kv: cloudflareKv },
    onRequestWithValidSession,
    oidc: { clientId, clientSecret, baseUrl },
  } = args;
  const paths = getSessionPaths();

  const oidcConfiguration = await discovery(
    new URL(baseUrl),
    clientId,
    clientSecret,
  );

  return async (request, env, ctx) => {
    const { pathname } = new URL(request.url);
    switch (pathname) {
      case paths.login:
        return await oidcRequestHandler(request, {
          callbackPath: paths.callback,
          openIdClientConfiguration: oidcConfiguration,
          session: Session.create(cloudflareKv),
        });
      case paths.callback: {
        const session = Session.continue(cloudflareKv, request);
        return await oidcCallbackHandler(request, {
          openIdClientConfiguration: oidcConfiguration,
          session,
        });
      }
      case paths.logout:
        return new Response("TODO: Logout");
    }

    const sessionData = await Session.get(cloudflareKv, request);
    if (sessionData?.user == null) {
      const loginUrl = new URL(paths.login, request.url);
      const { pathname: returnTo } = new URL(request.url);
      loginUrl.searchParams.set("returnTo", returnTo);

      return new Response(`Redirect to: ${loginUrl.toString()}`, {
        status: 307,
        headers: {
          Location: loginUrl.toString(),
          "Content-Type": "text/plain",
        },
      });
    }

    return onRequestWithValidSession(request, env, ctx, sessionData.user);
  };
};
