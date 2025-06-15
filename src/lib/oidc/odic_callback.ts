import { decodeJwt } from "jose";
import { authorizationCodeGrant } from "openid-client";
import type { UserInfoByIdToken } from "../../types.ts";
import { getOidcConfiguration } from "./configucation.ts";

interface OdicCallbackHandlerArgs {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  returnTo: string;
  pkceCodeVerifier: string;
}

interface OdicCallbackHandlerResult {
  response: Response;
  values?: {
    idToken: string;
    user: UserInfoByIdToken;
  };
}

export const oidcCallbackHandler = async (
  request: Request,
  args: OdicCallbackHandlerArgs,
): Promise<OdicCallbackHandlerResult> => {
  const { clientId, clientSecret, baseUrl, pkceCodeVerifier, returnTo } = args;

  const openIdClientConfiguration = await getOidcConfiguration({
    baseUrl,
    clientId,
    clientSecret,
  });
  const { id_token: idToken } = await authorizationCodeGrant(
    openIdClientConfiguration,
    new URL(request.url),
    {
      pkceCodeVerifier,
    },
  );

  if (typeof idToken !== "string") {
    return {
      response: new Response("ID token not found in authorization response", {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      }),
    };
  }

  const response = new Response(null, {
    status: 307,
    headers: {
      Location: returnTo,
      "Content-Type": "text/plain",
    },
  });

  const user = decodeJwt(idToken);
  return {
    response,
    values: {
      idToken,
      user,
    },
  };
};
