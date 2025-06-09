import { type Configuration, discovery } from "openid-client";

interface GetOidcConfigurationArgs {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export const getOidcConfiguration = (
  args: GetOidcConfigurationArgs,
): Promise<Configuration> => {
  const { baseUrl, clientId, clientSecret } = args;
  return discovery(new URL(baseUrl), clientId, clientSecret);
};
