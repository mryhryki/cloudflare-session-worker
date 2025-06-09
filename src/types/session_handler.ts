import type { KVNamespace } from "@cloudflare/workers-types";
import type { UserInfoByIdToken } from "./user_info.ts";

export type OnRequestWithAuth = (user: UserInfoByIdToken) => Promise<Response>;

export interface InitSessionHandlerArgs {
  cloudflare: {
    req: Request;
    kv: KVNamespace;
  };
  oidc: {
    clientId: string;
    clientSecret: string;
    // e.g.
    // - Amazon Cognito: https://cognito-idp.{region}.amazonaws.com/{region}_{random}
    baseUrl: string;
  };
  secret: {
    signingKey: string;
  };
}
