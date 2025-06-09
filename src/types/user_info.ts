export interface UserInfoByIdToken {
  iss?: string | undefined;
  sub?: string | undefined;
  aud?: string | string[] | undefined;
  exp?: number | undefined;
  iat?: number | undefined;
  [key: string]: unknown;
}
