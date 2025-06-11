import { describe, expect, it } from "vitest";
import { getSessionId } from "./get.ts";

interface TestValue {
  cookieValue: string;
  cookieName?: string;
  expectedValue: string | null;
}

describe("getSessionId()", () => {
  const testValues: TestValue[] = [
    {
      cookieValue:
        "session=2647680279ede8ce76e937efd94f9f3a1ea5d10ec26e39c096802b1e222cd495",
      expectedValue:
        "2647680279ede8ce76e937efd94f9f3a1ea5d10ec26e39c096802b1e222cd495",
    },
    // OK: Custom cookie name
    {
      cookieValue:
        "custom_session=bf5596189c0723afe667366d8958c75b90c2ac72cd50218c62f97cba527a6e77",
      expectedValue:
        "bf5596189c0723afe667366d8958c75b90c2ac72cd50218c62f97cba527a6e77",
      cookieName: "custom_session",
    },
    // OK: Long session ID (72 characters) -> In case higher entropy is required in the future.
    {
      cookieValue:
        "session=df515acbeab89f7b9bcc2e9839497f713763785e312f6e890112a30d1f42deb37cd07eee",
      expectedValue:
        "df515acbeab89f7b9bcc2e9839497f713763785e312f6e890112a30d1f42deb37cd07eee",
    },
    // NG: Short session ID (31 characters)
    {
      cookieValue:
        "session=f1ea0d7a2413501b62766282ed9220589d3942ad6b36d39b0a5877b3b839385",
      expectedValue: null,
    },
    // NG: Too short session ID (3 characters)
    {
      cookieValue: "session=389",
      expectedValue: null,
    },
    // NG: Has invalid characters
    {
      cookieValue:
        "session=x44edbd601877b9b8a088574a3dca29ef79489926cf1c8088362e1c1e6e2de60",
      expectedValue: null,
    },
    // NG: Invalid cookie name
    {
      cookieValue:
        "_session=c46ded808349c81c4ab573148aebcd170bd9b502193391078b8b5b44d054104b",
      expectedValue: null,
    },
  ];

  it.each(testValues)(
    "should return the expect result",
    ({ cookieValue, cookieName, expectedValue }) => {
      const req = new Request("http://example.com", {
        headers: {
          cookie: cookieValue,
        },
      });
      expect(getSessionId(req, cookieName)).toEqual(expectedValue);
    },
  );
});
