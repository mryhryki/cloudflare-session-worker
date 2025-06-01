import { discovery } from "openid-client";
import { getSessionPaths } from "./constants";
import { oidcRequestHandler } from "./handlers/odic_request";

export type SessionHandler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
) => Promise<Response>;

export interface InitSessionHandlerArgs {
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
    user: unknown /* TODO */,
  ) => Promise<Response>;
}

export const initSessionHandler = async (
  args: InitSessionHandlerArgs,
): Promise<SessionHandler> => {
  const {
    onRequestWithValidSession,
    oidc: { clientId, clientSecret, baseUrl },
  } = args;
  const paths = getSessionPaths();

  console.log(baseUrl, clientId, clientSecret);
  const oidcConfiguration = await discovery(
    new URL(baseUrl),
    clientId,
    clientSecret,
  );

  return async (request, env, ctx) => {
    const { pathname } = new URL(request.url);
    switch (pathname) {
      case paths.login:
        return await oidcRequestHandler(request, env, ctx, {
          openIdClientConfiguration: oidcConfiguration,
          callbackPath: paths.callback,
        });
      case paths.callback:
        return new Response("TODO: Callback");
      case paths.logout:
        return new Response("TODO: Logout");
    }

    const user: unknown = {}; // TODO

    return onRequestWithValidSession(request, env, ctx, user);
  };
};
