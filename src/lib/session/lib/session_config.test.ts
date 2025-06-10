import { describe, expect, it } from "vitest";
import type { SessionConfiguration } from "../../../types/session.ts";
import { getSessionConfiguration } from "./session_config.ts";

interface TestValue {
  argument: Partial<SessionConfiguration>;
  expectedResult: SessionConfiguration;
}

const DefaultMaxLifetimeSec = 7 * 86400; // 7 days
const DefaultIdleLifetimeSec = 86400; // 1 day

describe("getSessionConfiguration", () => {
  const testValues: TestValue[] = [
    {
      argument: {},
      expectedResult: {
        maxLifetimeSec: DefaultMaxLifetimeSec,
        idleLifetimeSec: DefaultIdleLifetimeSec,
      },
    },
    {
      argument: {
        idleLifetimeSec: 12345,
      },
      expectedResult: {
        maxLifetimeSec: DefaultMaxLifetimeSec,
        idleLifetimeSec: 12345,
      },
    },
    {
      argument: {
        maxLifetimeSec: 23456,
      },
      expectedResult: {
        maxLifetimeSec: 23456,
        idleLifetimeSec: DefaultIdleLifetimeSec,
      },
    },
    {
      argument: {
        idleLifetimeSec: 12345,
        maxLifetimeSec: 23456,
      },
      expectedResult: {
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
