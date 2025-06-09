import { decodeJwt } from "jose";
import {
  type Configuration as OpenIdClientConfiguration,
  authorizationCodeGrant,
} from "openid-client";
import type { SessionStoreInterface } from "../types/session.ts";

interface OdicCallbackHandlerArgs {
  openIdClientConfiguration: OpenIdClientConfiguration;
  sessionStore: SessionStoreInterface;
}

export const oidcCallbackHandler = async (
  request: Request,
  args: OdicCallbackHandlerArgs,
): Promise<Response> => {
  const { sessionStore, openIdClientConfiguration } = args;
  try {
    const session = await sessionStore.get();
    const pkceCodeVerifier = session?.loginContext?.pkceVerifier;
    if (typeof pkceCodeVerifier !== "string") {
      return new Response("PKCE code verifier not found in session", {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const { id_token } = await authorizationCodeGrant(
      openIdClientConfiguration,
      new URL(request.url),
      {
        pkceCodeVerifier,
      },
    );

    if (typeof id_token !== "string") {
      return new Response("ID token not found in authorization response", {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    let returnTo: URL = new URL(
      session?.loginContext?.returnTo ?? "/",
      request.url,
    );
    if (returnTo.origin !== new URL(request.url).origin) {
      returnTo = new URL("/", request.url);
    }

    const response = new Response(`Redirect to: ${returnTo.toString()}`, {
      status: 307,
      headers: {
        Location: returnTo.toString(),
        "Content-Type": "text/plain",
      },
    });

    const user = decodeJwt(id_token);
    await sessionStore.put({ loginContext: null, user }, response);

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
