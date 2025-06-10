import { describe, expect, it } from "vitest";
import { generateSessionId } from "./session_id.ts";

describe("generateSessionId", () => {
  it("should generate a unique session ID", () => {
    const sessionIds: string[] = Array.from({ length: 30 }, generateSessionId);

    for (const sessionId of sessionIds) {
      expect(sessionId).toMatch(/^[a-zA-Z0-9]{64}$/);
    }

    for (let i = 0; i < sessionIds.length; i++) {
      const sessionId1 = sessionIds[i];
      for (let j = i + 1; j < sessionIds.length; j++) {
        const sessionId2 = sessionIds[j];
        expect(sessionId1).not.toEqual(sessionId2);
      }
    }
  });
});
