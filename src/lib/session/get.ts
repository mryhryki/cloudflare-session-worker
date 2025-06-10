import type { GetSessionStore } from "../../types/session.ts";
import { getSessionConfiguration } from "./lib/session_config.ts";
import { generateSessionStore } from "./lib/session_store.ts";
import { getSessionId } from "./util/cookie/get.ts";

export const getSessionStore: GetSessionStore = async (kv, req, config) => {
  const sessionId = getSessionId(req);
  if (typeof sessionId !== "string") {
    return null;
  }
  return generateSessionStore({
    sessionId,
    kv,
    req,
    config: getSessionConfiguration(config),
  });
};
