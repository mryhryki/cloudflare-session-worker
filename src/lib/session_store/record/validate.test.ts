import { describe, expect, it } from "vitest";
import type {
  LoggedInSessionData,
  NotLoggedInSessionData,
  SessionExpiration,
} from "../../../types.ts";
import { generateSessionId } from "../../../util/session_id.ts";
import { validateSessionRecord } from "./validate.ts";

describe("validateSessionRecord()", () => {
  const BaseDate = new Date();
  const BaseUnixSec = Math.floor(BaseDate.getTime() / 1000);

  const notLoggedInSessionData: NotLoggedInSessionData = {
    status: "not-logged-in",
    loginContext: {
      pkceVerifier: "test-pkce-verifier",
      returnTo: "/path/to/return",
    },
  };
  const loggedInSessionData: LoggedInSessionData = {
    status: "logged-in",
    user: {
      iss: "https://issuer.example",
      sub: "35b456ff-535f-4eba-a029-adda9dad7dbb",
      aud: "https://audience.example",
      exp: BaseUnixSec + 3600, // 1 hour from now
      iat: BaseUnixSec, // now
      customClams: "custom-value",
    },
  };
  const expiration: SessionExpiration = {
    absolute: BaseUnixSec + 3600, // 1 hour from now
    idle: BaseUnixSec + 1800, // 30 minutes from now
  };

  interface TestValue {
    isValid: boolean;
    value: unknown;
  }

  const TestValues: TestValue[] = [
    // Not logged-in session record
    {
      isValid: true,
      value: {
        id: generateSessionId(),
        data: notLoggedInSessionData,
        expiration,
      },
    },
    // Not logged-in session record without returnTo
    {
      isValid: true,
      value: {
        id: generateSessionId(),
        data: {
          ...notLoggedInSessionData,
          loginContext: {
            ...notLoggedInSessionData.loginContext,
            returnTo: null,
          },
        },
        expiration,
      },
    },
    // Not logged-in session record without pkceVerifier
    {
      isValid: false,
      value: {
        id: generateSessionId(),
        data: {
          ...notLoggedInSessionData,
          loginContext: {
            ...notLoggedInSessionData.loginContext,
            pkceVerifier: null,
          },
        },
        expiration,
      },
    },
    // Logged-in session record
    {
      isValid: true,
      value: {
        id: generateSessionId(),
        data: loggedInSessionData,
        expiration,
      },
    },
    // Logged-in session record with empty user data
    {
      isValid: true,
      value: {
        id: generateSessionId(),
        data: {
          ...loggedInSessionData,
          user: {},
        },
        expiration,
      },
    },
    // Logged-in session record with no user
    {
      isValid: false,
      value: {
        id: generateSessionId(),
        data: {
          ...loggedInSessionData,
          user: null,
        },
        expiration,
      },
    },
    // Expired session record (absolute)
    {
      isValid: false,
      value: {
        id: generateSessionId(),
        data: loggedInSessionData,
        expiration: {
          ...expiration,
          absolute: Math.floor(Date.now() / 1000) - 10,
        },
      },
    },
    // Expired session record (idle)
    {
      isValid: false,
      value: {
        id: generateSessionId(),
        data: loggedInSessionData,
        expiration: {
          ...expiration,
          idle: Math.floor(Date.now() / 1000) - 10,
        },
      },
    },
    // Expired session record (absolute & idle)
    {
      isValid: false,
      value: {
        id: generateSessionId(),
        data: loggedInSessionData,
        expiration: {
          ...expiration,
          absolute: Math.floor(Date.now() / 1000) - 10,
          idle: Math.floor(Date.now() / 1000) - 10,
        },
      },
    },
  ];

  it.each(TestValues)(
    "should validate session record correctly",
    ({ value, isValid }) => {
      const result = validateSessionRecord(value, BaseDate);
      if (isValid) {
        expect(result).toEqual(value);
      } else {
        expect(result).toEqual(null);
      }
    },
  );
});
