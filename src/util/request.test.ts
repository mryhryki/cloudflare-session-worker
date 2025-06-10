import { describe, expect, it } from "vitest";
import { isInLocalDevelopment } from "./request.ts";

interface TestValue {
  url: string;
  expectResult: boolean;
}

describe("isInLocalDevelopment", () => {
  const testValues: TestValue[] = [
    { url: "http://localhost:8080", expectResult: true },
    { url: "http://localhost:8080/path/to/file", expectResult: true },
    { url: "http://localhost:3000", expectResult: true },
    { url: "http://localhost:3000/path/to/file", expectResult: true },
    { url: "https://localhost:8080", expectResult: false },
    { url: "https://localhost:3000", expectResult: false },
    { url: "https://example.com", expectResult: false },
    { url: "https://domain.example", expectResult: false },
    { url: "http://example.com", expectResult: false },
    { url: "http://domain.example", expectResult: false },
  ];
  it.each(testValues)(
    "should return the expect url",
    ({ url, expectResult }) => {
      const request = new Request(new URL(url));
      expect(isInLocalDevelopment(request)).toEqual(expectResult);
    },
  );
});
