import { z } from "zod";

const NotLoggedInSessionDataSchema = z.object({
  status: z.literal("not-logged-in"),
  loginContext: z.object({
    pkceVerifier: z.string(),
    returnTo: z.string().nullish(), // string | null | undefined
  }),
});

const LoggedInSessionDataSchema = z.object({
  status: z.literal("logged-in"),
  user: z
    .object({
      iss: z.string().optional(),
      sub: z.string().optional(),
      aud: z.union([z.string(), z.array(z.string())]).optional(),
      exp: z.number().optional(),
      iat: z.number().optional(),
    })
    .passthrough(),
});

const SessionDataSchema = z.discriminatedUnion("status", [
  LoggedInSessionDataSchema,
  NotLoggedInSessionDataSchema,
]);

const ExpirationSchema = z.object({
  absolute: z.number(),
  idle: z.number(),
});

export const SessionRecordSchema = z.object({
  id: z.string(),
  data: SessionDataSchema,
  expiration: ExpirationSchema,
});
