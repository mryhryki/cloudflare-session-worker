import { describe, expect, it } from "vitest";
import { isInLocalDevelopment } from "./request.ts";
import { getUnixSec, isAfter, toDate } from "./time.ts";

interface TestValuePair {
  iso8601: string;
  unixSec: number;
}
const TestValues: TestValuePair[] = [
  { iso8601: "2025-06-10T21:04:14.000Z", unixSec: 1749589454 },
  { iso8601: "2024-08-29T12:53:29.000Z", unixSec: 1724936009 },
  { iso8601: "2040-12-01T02:00:00.000Z", unixSec: 2237940000 },
];

describe("getUnixSec", () => {
  it.each(TestValues)(
    "should return the expect value",
    ({ iso8601, unixSec }) => {
      expect(getUnixSec(new Date(iso8601))).toEqual(unixSec);
    },
  );
});

describe("toDate", () => {
  it.each(TestValues)(
    "should return the expect value",
    ({ iso8601, unixSec }) => {
      expect(toDate(unixSec).toISOString()).toEqual(iso8601);
    },
  );
});

type TestValueForIsAfter = {
  currentTimeIso8601: string;
  baseTimeIso8601: string;
  expectedResult: boolean;
};

describe("isAfter", () => {
  const testValues: TestValueForIsAfter[] = [
    {
      currentTimeIso8601: "2025-06-11T12:00:00.000Z",
      baseTimeIso8601: "2025-06-10T12:00:00.000Z",
      expectedResult: true,
    },
    {
      currentTimeIso8601: "2025-06-10T12:00:01.000Z",
      baseTimeIso8601: "2025-06-10T12:00:00.000Z",
      expectedResult: true,
    },
    {
      currentTimeIso8601: "2025-06-10T12:00:00.000Z",
      baseTimeIso8601: "2025-06-10T12:00:00.000Z",
      expectedResult: false,
    },
    {
      currentTimeIso8601: "2025-06-10T11:59:59.999Z",
      baseTimeIso8601: "2025-06-10T12:00:00.000Z",
      expectedResult: false,
    },
    {
      currentTimeIso8601: "2025-06-09T12:00:00.000Z",
      baseTimeIso8601: "2025-06-10T12:00:00.000Z",
      expectedResult: false,
    },
  ];
  it.each(testValues)(
    "should return the expect value",
    ({ currentTimeIso8601, baseTimeIso8601, expectedResult }) => {
      const unixSec = getUnixSec(new Date(currentTimeIso8601));
      const baseDate = new Date(baseTimeIso8601);
      expect(isAfter(unixSec, baseDate)).toEqual(expectedResult);
    },
  );
});
