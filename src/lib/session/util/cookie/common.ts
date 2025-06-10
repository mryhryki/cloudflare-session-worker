import type { SerializeOptions } from "cookie";

export const DefaultCookieName = "session";

export const BaseSerializeOptions: SerializeOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
};
