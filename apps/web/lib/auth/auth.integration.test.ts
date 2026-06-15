import { describe, expect, it } from "bun:test";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { POST as logout } from "@/app/api/v1/auth/logout/route";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteUserByEmail, isDatabaseAvailable } from "@tend/db";

function uniqueEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function getSessionIdFromResponse(response: Response): string | null {
  const cookies = response.headers.getSetCookie();
  const prefix = `${SESSION_COOKIE_NAME}=`;

  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return cookie.slice(prefix.length).split(";")[0] ?? null;
    }
  }

  return null;
}

async function cleanupUser(email: string) {
  await deleteUserByEmail(getDb(), email);
}

describe("auth integration", () => {
  it("registers, logs in, validates session, and logs out", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available (start Docker with docker compose up -d)");
      return;
    }

    const email = uniqueEmail();
    const password = "password123";

    try {
      const registerResponse = await register(
        new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: "Test User",
            email,
            password,
          }),
        }),
      );

      expect(registerResponse.status).toBe(201);
      const registerBody = (await registerResponse.json()) as {
        user: { displayName: string; email: string };
      };
      expect(registerBody.user.displayName).toBe("Test User");
      expect(registerBody.user.email).toBe(email);

      const registerSessionId = getSessionIdFromResponse(registerResponse);
      expect(registerSessionId).toBeTruthy();

      const registeredSession = await validateSessionFromId(registerSessionId);
      expect(registeredSession.user?.email).toBe(email);

      const loginResponse = await login(
        new Request("http://localhost/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }),
      );

      expect(loginResponse.status).toBe(200);
      const loginSessionId = getSessionIdFromResponse(loginResponse);
      expect(loginSessionId).toBeTruthy();

      const loggedInSession = await validateSessionFromId(loginSessionId);
      expect(loggedInSession.user?.email).toBe(email);

      const logoutResponse = await logout(
        new Request("http://localhost/api/v1/auth/logout", {
          method: "POST",
          headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${loginSessionId}`,
          },
        }),
      );
      expect(logoutResponse.status).toBe(200);

      const invalidated = await validateSessionFromId(loginSessionId);
      expect(invalidated.user).toBeNull();
    } finally {
      await cleanupUser(email);
    }
  });

  it("rejects duplicate registration", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const email = uniqueEmail();

    try {
      const body = JSON.stringify({
        displayName: "Test User",
        email,
        password: "password123",
      });

      const first = await register(
        new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }),
      );
      expect(first.status).toBe(201);

      const second = await register(
        new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }),
      );
      expect(second.status).toBe(409);
    } finally {
      await cleanupUser(email);
    }
  });

  it("rejects invalid login credentials", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const response = await login(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "missing@example.com",
          password: "password123",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });
});
