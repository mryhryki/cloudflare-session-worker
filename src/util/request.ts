export const isInLocalDevelopment = (req: Request): boolean => {
  try {
    const url = new URL(req.url);
    return url.protocol === "http:" && url.hostname === "localhost";
  } catch {
    return false;
  }
};
