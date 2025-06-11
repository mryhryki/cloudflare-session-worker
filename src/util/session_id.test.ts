import { describe, expect, it } from "vitest";
import { getSessionId } from "../lib/session/util/cookie/get.ts";
import { generateSessionId, isValidSessionId } from "./session_id.ts";

describe("generateSessionId", () => {
  it("should generate a unique session ID", () => {
    const sessionIds: string[] = Array.from({ length: 30 }, generateSessionId);

    for (const sessionId of sessionIds) {
      expect(sessionId).toMatch(/^[0-9a-f]{64}$/);
      expect(isValidSessionId(sessionId)).toBe(true);
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

describe("isValidSessionId", () => {
  interface TestValue {
    sessionId: string;
    expectedResult: boolean;
  }
  const testValues: TestValue[] = [
    {
      sessionId:
        "2647680279ede8ce76e937efd94f9f3a1ea5d10ec26e39c096802b1e222cd495",
      expectedResult: true,
    },
    // OK: Long session ID (72 characters) -> In case higher entropy is required in the future.
    {
      sessionId:
        "df515acbeab89f7b9bcc2e9839497f713763785e312f6e890112a30d1f42deb37cd07eee",
      expectedResult: true,
    },
    // NG: Short session ID (31 characters)
    {
      sessionId:
        "f1ea0d7a2413501b62766282ed9220589d3942ad6b36d39b0a5877b3b839385",
      expectedResult: false,
    },
    // NG: Too short session ID (3 characters)
    {
      sessionId: "389",
      expectedResult: false,
    },
    // NG: Has invalid characters
    {
      sessionId:
        "x44edbd601877b9b8a088574a3dca29ef79489926cf1c8088362e1c1e6e2de60",
      expectedResult: false,
    },
  ];

  it.each(testValues)(
    "should return the expect result",
    ({ sessionId, expectedResult }) => {
      expect(isValidSessionId(sessionId)).toEqual(expectedResult);
    },
  );
});
