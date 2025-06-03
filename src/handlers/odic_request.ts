import {
  type Configuration as OpenIdClientConfiguration,
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomPKCECodeVerifier,
} from "openid-client";
import type { Session } from "../lib/session";

interface OdicRequestHandlerArgs {
  openIdClientConfiguration: OpenIdClientConfiguration;
  callbackPath: string;
  session: Session;
  scope?: string[];
}

export const oidcRequestHandler = async (
  request: Request,
  args: OdicRequestHandlerArgs,
): Promise<Response> => {
  try {
    const { callbackPath, openIdClientConfiguration, session } = args;

    const scope: string = Array.from(
      new Set([...(args.scope ?? []), "openid"]),
    ).join(" ");
    const redirect_uri = new URL(callbackPath, request.url).href;

    const code_verifier = randomPKCECodeVerifier();
    const code_challenge = await calculatePKCECodeChallenge(code_verifier);

    const location: string = buildAuthorizationUrl(openIdClientConfiguration, {
      redirect_uri,
      scope,
      code_challenge,
      code_challenge_method: "S256",
    }).href;

    const returnTo: string | null =
      new URL(request.url).searchParams.get("returnTo") ?? null;

    await session.put({
      loginContext: {
        pkceVerifier: code_verifier,
        returnTo,
      },
      user: null,
    });

    return new Response(`Redirect to: ${location}`, {
      status: 307,
      headers: {
        Location: location,
        "Content-Type": "text/plain",
        "Set-Cookie": session.generateCookieValue(),
      },
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      console.error("Stack:", err.stack);
    }
    return new Response("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
};
