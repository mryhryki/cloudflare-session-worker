import { describe, expect, it } from "vitest";
import { deleteSessionCookie } from "./delete.ts";
import { setSessionCookie } from "./set.ts";

interface TestValue {
  cookieName?: string;
  sessionId: string;
  secure: boolean;
  expires: Date;
  expectedValue: string;
}

describe("deleteSessionCookie()", () => {
  const TestDate = new Date("2040-12-31T12:00:00Z");
  const Expires: string = TestDate.toUTCString();

  const testValues: TestValue[] = [
    {
      sessionId:
        "795273192f271e9d3ef0659b4138715b57aeb876981486dea679de89368714c2",
      secure: true,
      expires: TestDate,
      expectedValue: `session=795273192f271e9d3ef0659b4138715b57aeb876981486dea679de89368714c2; Path=/; Expires=${Expires}; HttpOnly; Secure; SameSite=Lax`,
    },
    {
      sessionId:
        "ba2022746d5af8f169340e39a37fa7911571f65dde630b0ab000b0c286d72c94",
      secure: false,
      expires: TestDate,
      expectedValue: `session=ba2022746d5af8f169340e39a37fa7911571f65dde630b0ab000b0c286d72c94; Path=/; Expires=${Expires}; HttpOnly; SameSite=Lax`,
    },
    {
      cookieName: "custom_session",
      sessionId:
        "0f2571ce764943623d4ddd828937331af6d980bcbec87b5196323a2a375b4c5a",
      secure: true,
      expires: TestDate,
      expectedValue: `custom_session=0f2571ce764943623d4ddd828937331af6d980bcbec87b5196323a2a375b4c5a; Path=/; Expires=${Expires}; HttpOnly; Secure; SameSite=Lax`,
    },
    {
      cookieName: "custom_session",
      sessionId:
        "0f2571ce764943623d4ddd828937331af6d980bcbec87b5196323a2a375b4c5a",
      secure: false,
      expires: TestDate,
      expectedValue: `custom_session=0f2571ce764943623d4ddd828937331af6d980bcbec87b5196323a2a375b4c5a; Path=/; Expires=${Expires}; HttpOnly; SameSite=Lax`,
    },
  ];

  it.each(testValues)(
    "should set a expected Set-Cookie header",
    ({ expectedValue, ...args }) => {
      const res = new Response();
      setSessionCookie(res, args);
      const cookieHeader = res.headers.get("Set-Cookie");
      expect(cookieHeader).toBe(expectedValue);
    },
  );
});
