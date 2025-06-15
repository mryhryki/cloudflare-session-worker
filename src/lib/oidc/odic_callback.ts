import { decodeJwt } from "jose";
import { authorizationCodeGrant } from "openid-client";
import type { OidcParams, SessionStoreInterface } from "../../types.ts";
import { forceSameOrigin } from "../../util/url.ts";
import { getOidcConfiguration } from "./configucation.ts";

interface OdicCallbackHandlerArgs {
  oidcParams: OidcParams;
  sessionStore: SessionStoreInterface;
}

export const oidcCallbackHandler = async (
  request: Request,
  args: OdicCallbackHandlerArgs,
): Promise<Response> => {
  const {
    sessionStore,
    oidcParams: { baseUrl, clientId, clientSecret },
  } = args;
  try {
    const session = await sessionStore.get();
    const pkceCodeVerifier =
      session?.status !== "not-logged-in"
        ? null
        : session?.loginContext?.pkceVerifier;
    if (typeof pkceCodeVerifier !== "string") {
      return new Response("PKCE code verifier not found in session", {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

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
      return new Response("ID token not found in authorization response", {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const returnTo = forceSameOrigin(
      session?.status === "not-logged-in"
        ? (session?.loginContext?.returnTo ?? "/")
        : "/",
      request.url,
    );

    const response = new Response(`Redirect to: ${returnTo}`, {
      status: 307,
      headers: {
        Location: returnTo.toString(),
        "Content-Type": "text/plain",
      },
    });

    const user = decodeJwt(idToken);
    await sessionStore.put({ status: "logged-in", idToken, user }, response);

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
