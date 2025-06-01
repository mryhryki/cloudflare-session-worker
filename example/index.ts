import { type SessionHandler, initSessionHandler } from "../src/index";

let sessionHandler: SessionHandler | null = null;
const execSessionHandler = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> => {
  const getRequiredEnv = (name: string): string => {
    const value = env[name];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    throw new Error(`Environment variable ${name} is required`);
  };

  if (sessionHandler == null) {
    sessionHandler = await initSessionHandler({
      oidc: {
        clientId: getRequiredEnv("OIDC__CLIENT_ID"),
        clientSecret: getRequiredEnv("OIDC__CLIENT_SECRET"),
        // e.g. https://your-auth-domain.example
        baseUrl: getRequiredEnv("OIDC__BASE_URL"),
      },
      secret: {
        // e.g. `openssl rand -hex 32`
        signingKey: getRequiredEnv("SECRET__SIGNING_KEY"),
      },
      onRequestWithValidSession: async (request, env, ctx, user) => {
        return new Response(JSON.stringify(user, null, 2), {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      },
    });
  }
  return sessionHandler(request, env, ctx);
};

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const { pathname } = new URL(request.url);
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

    return await execSessionHandler(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
