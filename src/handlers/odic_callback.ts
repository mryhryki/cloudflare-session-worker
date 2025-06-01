import {
  type Configuration as OpenIdClientConfiguration,
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomPKCECodeVerifier,
} from "openid-client";

import type { RequestHandler } from "../types";

interface OdicRequestHandlerArgs {
  openIdClientConfiguration: OpenIdClientConfiguration;
  callbackPath: string;
  scope?: string[];
}

export const oidcRequestHandler = async (
  request: Request,
  _env: Env,
  _ctx: ExecutionContext,
  args: OdicRequestHandlerArgs,
): Promise<Response> => {
  try {
    const { callbackPath, openIdClientConfiguration } = args;

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

    return new Response(`Redirect to: ${location}`, {
      status: 307,
      headers: {
        Location: location,
        "Content-Type": "text/plain",
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
