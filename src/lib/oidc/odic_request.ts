import {
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomPKCECodeVerifier,
} from "openid-client";
import type { OidcParams, SessionStoreInterface } from "../../types.ts";
import { forceSameOrigin } from "../../util/url.ts";
import { getOidcConfiguration } from "./configucation.ts";

interface OdicRequestHandlerArgs {
  requestUrl: string;
  callbackPath: string;
  oidcParams: OidcParams;
  sessionStore: SessionStoreInterface;
  scope?: string[];
}

export const oidcRequestHandler = async (
  args: OdicRequestHandlerArgs,
): Promise<Response> => {
  const {
    requestUrl,
    callbackPath,
    oidcParams: { baseUrl, clientId, clientSecret },
    sessionStore,
  } = args;

  const scope: string = Array.from(
    new Set([...(args.scope ?? []), "openid"]),
  ).join(" ");
  const redirect_uri = forceSameOrigin(callbackPath, requestUrl);

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
    new URL(requestUrl).searchParams.get("returnTo") ?? null;

  const response = new Response(`Redirect to: ${location}`, {
    status: 307,
    headers: {
      Location: location,
      "Content-Type": "text/plain",
    },
  });

  await sessionStore.put(
    {
      status: "not-logged-in",
      loginContext: {
        pkceCodeVerifier: code_verifier,
        returnTo,
      },
    },
    response,
  );

  return response;
};
