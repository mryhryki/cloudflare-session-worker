import type { KVNamespace } from "@cloudflare/workers-types";
import { requireAuth } from "../src/index";

interface Env extends Cloudflare.Env {
  SESSION_STORE: KVNamespace;
  [key: string]: unknown;
}

export default {
  async fetch(req, env, _ctx): Promise<Response> {
    const { pathname } = new URL(req.url);
    if (pathname === "/health") {
      return new Response("OK", {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
    if (pathname === "/favicon.ico") {
      return new Response(null, { status: 404 });
    }

    const getRequiredEnv = (name: string): string => {
      const value = env[name];
      if (typeof value === "string" && value.trim().length > 0)
        return value.trim();
      throw new Error(`Environment variable ${name} is required`);
    };

    return await requireAuth(
      async (user) => {
        const { pathname } = new URL(req.url);
        const { sub, email } = user;
        return new Response(
          JSON.stringify({ pathname, user: { sub, email } }, null, 2),
          {
            headers: {
              "Content-Type": "text/plain",
            },
          },
        );
      },
      {
        cloudflare: { req, kv: env.SESSION_STORE },
        oidc: {
          clientId: getRequiredEnv("OIDC__CLIENT_ID"),
          clientSecret: getRequiredEnv("OIDC__CLIENT_SECRET"),
          // e.g. https://your-auth-domain.example
          baseUrl: getRequiredEnv("OIDC__BASE_URL"),
          postLogoutRedirectUri: getRequiredEnv(
            "OIDC__POST_LOGOUT_REDIRECT_URI",
          ),
        },
        session: undefined,
      },
    );
  },
} satisfies ExportedHandler<Env>;
