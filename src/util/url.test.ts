import { describe, expect, it } from "vitest";
import { forceSameOrigin } from "./url.ts";

interface TestValue {
  urlOrPath: string;
  baseUrl: string;
  expectUrl: string;
}

describe("forceSameOrigin", () => {
  const testValues: TestValue[] = [
    {
      urlOrPath: "/path/to/some/file",
      baseUrl: "https://cloudflare-session-worker.example",
      expectUrl: "https://cloudflare-session-worker.example/path/to/some/file",
    },
    {
      urlOrPath: "/path/to/dir/",
      baseUrl: "https://cloudflare-session-worker.example",
      expectUrl: "https://cloudflare-session-worker.example/path/to/dir/",
    },
    {
      urlOrPath: "/path?with=query#with-hash",
      baseUrl: "https://cloudflare-session-worker.example",
      expectUrl:
        "https://cloudflare-session-worker.example/path?with=query#with-hash",
    },
    {
      urlOrPath: "https://example.com/path/to/file",
      baseUrl: "https://cloudflare-session-worker.example",
      expectUrl: "https://cloudflare-session-worker.example/path/to/file",
    },
    {
      urlOrPath: "https://example.com/path?with=query#with-hash",
      baseUrl: "https://cloudflare-session-worker.example",
      expectUrl:
        "https://cloudflare-session-worker.example/path?with=query#with-hash",
    },
  ];
  it.each(testValues)(
    "should return the expect url",
    ({ urlOrPath, baseUrl, expectUrl }) => {
      expect(forceSameOrigin(urlOrPath, baseUrl).toString()).toEqual(expectUrl);
    },
  );
});
