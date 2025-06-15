import {
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomPKCECodeVerifier,
} from "openid-client";
import { forceSameOrigin } from "../../util/url.ts";
import { getOidcConfiguration } from "./configucation.ts";

interface OdicRequestHandlerArgs {
  baseUrl: string;
  callbackPath: string;
  clientId: string;
  clientSecret: string;
  requestUrl: string;
  scope?: string[];
}

interface OdicRequestHandlerResult {
  response: Response;
  values?: {
    pkceCodeVerifier: string;
  };
}

export const oidcRequestHandler = async (
  args: OdicRequestHandlerArgs,
): Promise<OdicRequestHandlerResult> => {
  const { requestUrl, callbackPath, baseUrl, clientId, clientSecret } = args;

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

  const response = new Response(`Redirect to: ${location}`, {
    status: 307,
    headers: {
      Location: location,
      "Content-Type": "text/plain",
    },
  });

  return {
    response,
    values: {
      pkceCodeVerifier: code_verifier,
    },
  };
};
