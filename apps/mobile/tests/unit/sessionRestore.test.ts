import { describe, expect, it } from "bun:test";
import { ApiError } from "../../src/services/apiError";
import type { UserResponse } from "../../src/types";
import { restoreSession } from "../../src/utils/sessionRestore";

type SessionClient = {
  me: () => Promise<{ user: UserResponse }>;
  clearSession: () => Promise<void>;
};

function createClient(overrides: Partial<SessionClient> = {}): SessionClient {
  return {
    me: async () => ({ user: { id: "u1", email: "a@b.com", displayName: "Alex" } }),
    clearSession: async () => {},
    ...overrides,
  };
}

describe("restoreSession", () => {
  it("returns the user when session restore succeeds", async () => {
    const user = await restoreSession(createClient(), 50);
    expect(user?.displayName).toBe("Alex");
  });

  it("clears the session and returns null on unauthorized responses", async () => {
    let cleared = false;

    const user = await restoreSession(
      createClient({
        me: async () => {
          throw new ApiError("Unauthorized", 401);
        },
        clearSession: async () => {
          cleared = true;
        },
      }),
      50,
    );

    expect(user).toBeNull();
    expect(cleared).toBe(true);
  });

  it("returns null when session restore times out", async () => {
    const user = await restoreSession(
      createClient({
        me: () => new Promise(() => {}),
      }),
      20,
    );

    expect(user).toBeNull();
  });
});
