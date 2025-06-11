import type { CreateSessionStore } from "../../types/session.ts";
import { generateSessionId } from "../../util/session_id.ts";
import { getSessionConfiguration } from "./config/session_config.ts";
import { generateSessionStore } from "./session_store/session_store.ts";

export const createSessionStore: CreateSessionStore = (kv, req, config) =>
  generateSessionStore({
    sessionId: generateSessionId(),
    kv,
    req,
    config: getSessionConfiguration(config),
  });
