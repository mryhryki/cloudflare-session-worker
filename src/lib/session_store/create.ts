import type { CreateSessionStore } from "../../types.ts";
import { generateSessionId } from "../../util/session_id.ts";
import { getSessionStore } from "./get.ts";

export const createSessionStore: CreateSessionStore = async (args) => {
  const { kv, useSecureCookie, config } = args;

  return await getSessionStore({
    sessionId: generateSessionId(),
    kv,
    useSecureCookie,
    config,
  });
};
