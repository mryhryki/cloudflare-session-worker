import type { KVNamespace } from "@cloudflare/workers-types";
import type {
  SessionConfiguration,
  UserInfoByIdToken,
} from "./lib/session_store/record/types.ts";

export type OnRequestWithAuth = (user: UserInfoByIdToken) => Promise<Response>;

export interface CloudflareParams {
  req: Request;
  kv: KVNamespace;
}

export interface OidcParams {
  clientId: string;
  clientSecret: string;
  // e.g.
  // - Amazon Cognito: https://cognito-idp.{region}.amazonaws.com/{region}_{random}
  baseUrl: string;
}

export interface InitSessionHandlerParams {
  cloudflare: CloudflareParams;
  oidc: OidcParams;
  session?: Partial<SessionConfiguration>;
}
