import { describe, expect, it } from "vitest";
import { deleteSessionCookie } from "./delete.ts";

interface TestValue {
  cookieName?: string;
  sessionId: string;
  secure: boolean;
  expectedValue: string;
}

describe("deleteSessionCookie()", () => {
  const testValues: TestValue[] = [
    {
      sessionId:
        "795273192f271e9d3ef0659b4138715b57aeb876981486dea679de89368714c2",
      secure: true,
      expectedValue:
        "session=795273192f271e9d3ef0659b4138715b57aeb876981486dea679de89368714c2; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
    },
    {
      sessionId:
        "af673cf0fe165bf88e47c8a989f5ac1ca54cc5d6e02d06161dd332dada498961",
      secure: false,
      expectedValue:
        "session=af673cf0fe165bf88e47c8a989f5ac1ca54cc5d6e02d06161dd332dada498961; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    },
    {
      cookieName: "custom_name",
      sessionId:
        "462e8d36b8c74356e8c9eb6bf1d109cb2f7ef8d871a2a9cfb2750c74e1a448eb",
      secure: true,
      expectedValue:
        "custom_name=462e8d36b8c74356e8c9eb6bf1d109cb2f7ef8d871a2a9cfb2750c74e1a448eb; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
    },
    {
      cookieName: "custom_session",
      sessionId:
        "f0c45c62639a888e86fc5f09b1e4d95060a028dc12f7602bf15fde645b2bb9e7",
      secure: false,
      expectedValue:
        "custom_session=f0c45c62639a888e86fc5f09b1e4d95060a028dc12f7602bf15fde645b2bb9e7; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    },
  ];

  it.each(testValues)(
    "should set a expected Set-Cookie header",
    ({ expectedValue, ...args }) => {
      const res = new Response();
      deleteSessionCookie(res, args);
      const cookieHeader = res.headers.get("Set-Cookie");
      expect(cookieHeader).toBe(expectedValue);
    },
  );
});
