import { describe, expect, it } from "vitest";
import { getSessionPaths } from "./constants";

describe("constants", () => {
  describe("getSessionPaths()", () => {
    it("should return paths with default prefix", () => {
      expect(getSessionPaths()).toEqual({
        callback: "/session/callback",
        login: "/session/login",
        logout: "/session/logout",
      });
    });

    it("should return paths with specified path", () => {
      expect(getSessionPaths("/foo")).toEqual({
        callback: "/foo/callback",
        login: "/foo/login",
        logout: "/foo/logout",
      });
    });
  });
});
