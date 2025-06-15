import type { KVNamespace } from "@cloudflare/workers-types";
import { describe, expect, it } from "vitest";
import type { SessionData } from "../../../types.ts";
import { generateGetRecordFunction } from "./get_record.ts";

describe("generateGetRecordFunction()", () => {
  const ExistsSessionId =
    "c45eb3f96e1186fd497eba52248ff4818dd3bfc02ed60a86f8bd4199807eaddb";
  const ExpiredSessionId =
    "b16a8ab03321b900fc56490f88670995c4b71d0f39bd592d5216120e846eae29";
  const NotExistsSessionId =
    "e82dd2063caa6d5a23082e69d4012ffaad21ac661aa18ab6463a46954f6b6f8b";

  const nowUnixSec: number = Math.floor(new Date().getTime() / 1000);
  const BaseSessionData: SessionData = {
    status: "not-logged-in",
    loginContext: {
      pkceCodeVerifier: "abcd1234",
    },
  };

  const kvMock: KVNamespace = {
    get: async (key: string) => {
      switch (key) {
        case ExistsSessionId: {
          return {
            id: ExistsSessionId,
            data: BaseSessionData,
            expiration: {
              absolute: nowUnixSec + 10,
              idle: nowUnixSec + 10,
            },
          };
        }
        case ExpiredSessionId: {
          return {
            id: ExistsSessionId,
            data: BaseSessionData,
            expiration: {
              absolute: nowUnixSec - 10,
              idle: nowUnixSec - 10,
            },
          };
        }
        default:
          return null;
      }
    },
    // biome-ignore lint/suspicious/noExplicitAny: It's a mock for testing
  } as any;

  it("should return a valid record", async () => {
    const getSessionRecord = generateGetRecordFunction({ kv: kvMock });
    const record = await getSessionRecord(ExistsSessionId);
    expect(record?.id).toEqual(ExistsSessionId);
    expect(record?.data).toEqual(BaseSessionData);
  });

  it("should return null if record is expired", async () => {
    const getSessionRecord = generateGetRecordFunction({ kv: kvMock });
    const record = await getSessionRecord(ExpiredSessionId);
    expect(record).toEqual(null);
  });

  it("should return null if specified not exists sessionId", async () => {
    const getSessionRecord = generateGetRecordFunction({ kv: kvMock });
    const record = await getSessionRecord(NotExistsSessionId);
    expect(record).toEqual(null);
  });

  it("should return null if specified invalid sessionId", async () => {
    const getSessionRecord = generateGetRecordFunction({ kv: kvMock });
    const record = await getSessionRecord("invalid-session-id");
    expect(record).toEqual(null);
  });
});
