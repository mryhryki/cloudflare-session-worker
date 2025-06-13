import type { KVNamespace } from "@cloudflare/workers-types";
import { getSessionId } from "../lib/session_store/cookie/get.ts";
import { getSessionStore } from "../lib/session_store/get.ts";
import type {
  OidcParams,
  OnRequestWithAuth,
  SessionConfiguration,
  SessionPaths,
} from "../types.ts";
import { isInLocalDevelopment } from "../util/request.ts";

interface DefaultHandlerArgs {
  config: SessionConfiguration;
  kv: KVNamespace;
  paths: SessionPaths;
  req: Request;
}

export const defaultHandler = async (
  handler: OnRequestWithAuth,
  args: DefaultHandlerArgs,
): Promise<Response> => {
  const { req, config, kv, paths } = args;

  const loginUrl = new URL(paths.login, req.url);
  loginUrl.searchParams.set("returnTo", new URL(req.url).pathname);
  const redirectToLoginResponse = new Response(
    `Redirect to: ${loginUrl.toString()}`,
    {
      status: 307,
      headers: {
        Location: loginUrl.toString(),
        "Content-Type": "text/plain",
      },
    },
  );

  const sessionId = getSessionId(req, config.cookieName);
  if (typeof sessionId !== "string") {
    return redirectToLoginResponse;
  }

  const sessionStore = await getSessionStore({
    config,
    useSecureCookie: !isInLocalDevelopment(req),
    kv,
    sessionId,
  });
  const session = await sessionStore?.get();
  if (session?.status !== "logged-in") {
    return redirectToLoginResponse;
  }

  const response = await handler(session.user);
  await sessionStore.put(session, response);
  return response;
};
