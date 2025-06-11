import type { GetSessionStore } from "../../types/session.ts";
import { getSessionConfiguration } from "./config/session_config.ts";
import { getSessionId } from "./cookie/get.ts";
import { generateSessionStore } from "./session_store/index.ts";

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
