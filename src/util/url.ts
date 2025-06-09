export const forceSameOrigin = (url: string, baseUrl: string): string => {
  const u = new URL(url, baseUrl);
  return new URL(`${u.pathname}${u.search}${u.hash}`, baseUrl).toString();
};
