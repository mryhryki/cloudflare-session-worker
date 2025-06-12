import { generateSessionId } from "../../util/session_id.ts";
import { getSessionStore } from "./get.ts";
import type { CreateSessionStore } from "./record/types.ts";

export const createSessionStore: CreateSessionStore = async (args) => {
  const { kv, useSecureCookie, config } = args;

  return await getSessionStore({
    sessionId: generateSessionId(),
    kv,
    useSecureCookie,
    config,
  });
};
