import { describe, expect, it } from "vitest";
import type { SessionConfiguration } from "../../../types.ts";
import { getSessionConfiguration } from "./session_config.ts";

interface TestValue {
  argument: Partial<SessionConfiguration>;
  expectedResult: SessionConfiguration;
}

const DefaultCookieName = "session";
const DefaultMaxLifetimeSec = 7 * 86400; // 7 days
const DefaultIdleLifetimeSec = 86400; // 1 day

describe("getSessionConfiguration", () => {
  const testValues: TestValue[] = [
    {
      argument: {},
      expectedResult: {
        fallbackPath: "/",
        cookieName: DefaultCookieName,
        maxLifetimeSec: DefaultMaxLifetimeSec,
        idleLifetimeSec: DefaultIdleLifetimeSec,
      },
    },
    {
      argument: {
        fallbackPath: "/home",
      },
      expectedResult: {
        fallbackPath: "/home",
        cookieName: DefaultCookieName,
        maxLifetimeSec: DefaultMaxLifetimeSec,
        idleLifetimeSec: DefaultIdleLifetimeSec,
      },
    },
    {
      argument: {
        cookieName: "session-id",
      },
      expectedResult: {
        fallbackPath: "/",
        cookieName: "session-id",
        maxLifetimeSec: DefaultMaxLifetimeSec,
        idleLifetimeSec: DefaultIdleLifetimeSec,
      },
    },
    {
      argument: {
        idleLifetimeSec: 12345,
      },
      expectedResult: {
        fallbackPath: "/",
        cookieName: DefaultCookieName,
        maxLifetimeSec: DefaultMaxLifetimeSec,
        idleLifetimeSec: 12345,
      },
    },
    {
      argument: {
        maxLifetimeSec: 23456,
      },
      expectedResult: {
        fallbackPath: "/",
        cookieName: DefaultCookieName,
        maxLifetimeSec: 23456,
        idleLifetimeSec: DefaultIdleLifetimeSec,
      },
    },
    {
      argument: {
        fallbackPath: "/home",
        cookieName: "custom-name",
        idleLifetimeSec: 12345,
        maxLifetimeSec: 23456,
      },
      expectedResult: {
        fallbackPath: "/home",
        cookieName: "custom-name",
        maxLifetimeSec: 23456,
        idleLifetimeSec: 12345,
      },
    },
  ];
  it.each(testValues)(
    "should return the expect result",
    ({ argument, expectedResult }) => {
      expect(getSessionConfiguration(argument)).toEqual(expectedResult);
    },
  );
});
