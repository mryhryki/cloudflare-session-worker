import type { Session } from "../lib/session";

export const isLocalhost = (req: Request): boolean => {
  try {
    const url = new URL(req.url);
    return url.hostname === "localhost";
  } catch {
    return false;
  }
};
