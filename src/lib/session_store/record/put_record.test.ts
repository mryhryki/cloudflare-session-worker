import type { KVNamespace } from "@cloudflare/workers-types";
import { beforeEach, describe, expect, it } from "vitest";
import type { SessionConfiguration, SessionData } from "../../../types.ts";
import { getUnixSec } from "../../../util/time.ts";
import { generatePutRecordFunction } from "./put_record.ts";

describe("generatePutRecordFunction()", () => {
  const SessionId =
    "bf0a9e354aa03f09f9db02c132a290095bc7391949a58f71826b91cc76221fef";
  const Config: SessionConfiguration = {
    fallbackPath: "/",
    cookieName: "session",
    maxLifetimeSec: 1000,
    idleLifetimeSec: 200,
  };

  const Data: SessionData = {
    status: "not-logged-in",
    loginContext: {
      pkceCodeVerifier: "abcd1234",
    },
  };

  let latestArguments: unknown = null;
  beforeEach(() => {
    latestArguments = null;
  });

  const kvMock: KVNamespace = {
    put: async (...args: unknown[]) => {
      latestArguments = args;
    },
    // biome-ignore lint/suspicious/noExplicitAny: It's a mock for testing
  } as any;

  it("should call kv.put() with expected arguments", async () => {
    const baseDate = new Date();
    const baseUnixSec = getUnixSec(baseDate);
    const putSessionRecord = generatePutRecordFunction({
      kv: kvMock,
      config: Config,
    });
    await putSessionRecord(
      {
        sessionId: SessionId,
        sessionData: Data,
        sessionRecord: null,
      },
      baseDate,
    );
    expect(latestArguments).toEqual([
      SessionId,
      JSON.stringify({
        id: SessionId,
        data: Data,
        expiration: {
          absolute: baseUnixSec + Config.maxLifetimeSec,
          idle: baseUnixSec + Config.idleLifetimeSec,
        },
      }),
      {
        expiration:
          baseUnixSec + Math.min(Config.maxLifetimeSec, Config.idleLifetimeSec),
      },
    ]);
  });

  it("should call kv.put() with expected expiration", async () => {
    const baseDate = new Date();
    const baseUnixSec = getUnixSec(baseDate);
    const putSessionRecord = generatePutRecordFunction({
      kv: kvMock,
      config: Config,
    });

    const absoluteExpiration = baseUnixSec + 500;
    await putSessionRecord(
      {
        sessionId: SessionId,
        sessionData: Data,
        sessionRecord: {
          id: SessionId,
          data: Data,
          expiration: {
            absolute: absoluteExpiration,
            idle: baseUnixSec + 100,
          },
        },
      },
      baseDate,
    );
    expect(latestArguments).toEqual([
      SessionId,
      JSON.stringify({
        id: SessionId,
        data: Data,
        expiration: {
          absolute: absoluteExpiration,
          idle: baseUnixSec + Config.idleLifetimeSec,
        },
      }),
      {
        expiration: Math.min(
          absoluteExpiration,
          baseUnixSec + Config.idleLifetimeSec,
        ),
      },
    ]);
  });

  it("should call kv.put() with invalid session ID", async () => {
    const putSessionRecord = generatePutRecordFunction({
      kv: kvMock,
      config: Config,
    });
    expect(
      putSessionRecord(
        {
          sessionId: "invalid-session-id",
          sessionData: Data,
          sessionRecord: null,
        },
        new Date(),
      ),
    ).rejects.toThrow(new Error("Internal Error: Invalid session ID"));
  });
});
