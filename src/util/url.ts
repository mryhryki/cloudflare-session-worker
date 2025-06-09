// TODO: Add unit tests
export const forceSameOrigin = (url: string, req: Request): URL => {
  const u = new URL(url, req.url);
  return new URL(`${u.pathname}${u.search}${u.hash}`, req.url);
};
