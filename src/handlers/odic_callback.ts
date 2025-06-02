import {
  type Configuration as OpenIdClientConfiguration,
  authorizationCodeGrant,
} from "openid-client";
import type { Session } from "../lib/session";

interface OdicCallbackHandlerArgs {
  openIdClientConfiguration: OpenIdClientConfiguration;
  session: Session;
}

export const oidcCallbackHandler = async (
  request: Request,
  args: OdicCallbackHandlerArgs,
): Promise<Response> => {
  const { session, openIdClientConfiguration } = args;
  try {
    const pkceCodeVerifier = (await session.get())?.pkceVerifier;
    if (typeof pkceCodeVerifier !== "string") {
      return new Response("PKCE code verifier not found in session", {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    await authorizationCodeGrant(
      openIdClientConfiguration,
      new URL(request.url),
      {
        pkceCodeVerifier,
      },
    );

    // TODO: Get returnTo from session
    // TODO: Check url in same origin
    const returnTo = "/";

    return new Response(`Redirect to: ${returnTo}`, {
      status: 307,
      headers: {
        Location: returnTo,
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
