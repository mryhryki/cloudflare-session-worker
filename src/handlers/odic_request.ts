import {
  type Configuration as OpenIdClientConfiguration,
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomPKCECodeVerifier,
} from "openid-client";
import { getOidcConfiguration } from "../lib/oidc/configucation.ts";
import type { SessionStoreInterface } from "../lib/session_store/record/types.ts";
import type { InitSessionHandlerParams, OidcParams } from "../types.ts";

interface OdicRequestHandlerArgs {
  callbackPath: string;
  oidcParams: OidcParams;
  session: SessionStoreInterface;
  scope?: string[];
}

export const oidcRequestHandler = async (
  request: Request,
  args: OdicRequestHandlerArgs,
): Promise<Response> => {
  try {
    const {
      callbackPath,
      oidcParams: { baseUrl, clientId, clientSecret },
      session,
    } = args;

    const scope: string = Array.from(
      new Set([...(args.scope ?? []), "openid"]),
    ).join(" ");
    const redirect_uri = new URL(callbackPath, request.url).href;

    const code_verifier = randomPKCECodeVerifier();
    const code_challenge = await calculatePKCECodeChallenge(code_verifier);

    const openIdClientConfiguration = await getOidcConfiguration({
      baseUrl,
      clientId,
      clientSecret,
    });
    const location: string = buildAuthorizationUrl(openIdClientConfiguration, {
      redirect_uri,
      scope,
      code_challenge,
      code_challenge_method: "S256",
    }).href;

    const returnTo: string | null =
      new URL(request.url).searchParams.get("returnTo") ?? null;

    const response = new Response(`Redirect to: ${location}`, {
      status: 307,
      headers: {
        Location: location,
        "Content-Type": "text/plain",
      },
    });

    await session.put(
      {
        status: "not-logged-in",
        loginContext: {
          pkceVerifier: code_verifier,
          returnTo,
        },
      },
      response,
    );

    return response;
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
