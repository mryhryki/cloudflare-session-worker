import { buildEndSessionUrl } from "openid-client";
import type { OidcParams, SessionStoreInterface } from "../../types.ts";
import { getOidcConfiguration } from "./configucation.ts";

interface OdicLogoutHandlerArgs {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  postLogoutRedirectUri: string;
  idToken: string;
}

export const oidcLogoutHandler = async (
  args: OdicLogoutHandlerArgs,
): Promise<Response> => {
  const { clientId, clientSecret, baseUrl, postLogoutRedirectUri, idToken } =
    args;
  const oidcConfiguration = await getOidcConfiguration({
    clientId,
    clientSecret,
    baseUrl,
  });
  const endSessionUrl: URL = buildEndSessionUrl(oidcConfiguration, {
    post_logout_redirect_uri: postLogoutRedirectUri,
    id_token_hint: idToken,
  });
  // for Amazon Cognito.
  // Ref: https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html#get-logout
  endSessionUrl.searchParams.set("logout_uri", postLogoutRedirectUri);

  return new Response(`Redirect to: ${endSessionUrl.href}`, {
    status: 307,
    headers: { Location: endSessionUrl.href, "Content-Type": "text/plain" },
  });
};
