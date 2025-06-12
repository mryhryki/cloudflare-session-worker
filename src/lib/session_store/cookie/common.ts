import type { SerializeOptions } from "cookie";

export const BaseSerializeOptions: SerializeOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
};
