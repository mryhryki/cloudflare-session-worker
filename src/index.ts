import { getSessionPaths } from "./constants";
import { callbackHandler } from "./handlers/callback.ts";
import { defaultHandler } from "./handlers/default.ts";
import { loginHandler } from "./handlers/login.ts";
import { getSessionConfiguration } from "./lib/session_store/config/session_config.ts";
import type { InitSessionHandlerParams, OnRequestWithAuth } from "./types.ts";

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

  switch (new URL(req.url).pathname) {
    case paths.login:
      return await loginHandler({ config, kv, oidcParams, paths, req });
    case paths.callback:
      return await callbackHandler({ config, kv, oidcParams, req });
    case paths.logout:
      return new Response("TODO: Logout");
    default:
      return await defaultHandler(handler, { config, kv, paths, req });
  }
};
