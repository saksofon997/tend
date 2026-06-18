import { describe, expect, it } from "bun:test";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { GET as getSettings, PUT as putSettings } from "@/app/api/v1/settings/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteUserByEmail, isDatabaseAvailable } from "@tend/db";

function uniqueEmail(): string {
  return `settings-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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

async function registerTestUser() {
  process.env.ALLOWED_EMAILS = undefined;

  const email = uniqueEmail();
  const response = await register(
    new Request("http://localhost/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Settings Tester",
        email,
        password: "password123",
      }),
    }),
  );

  const sessionId = getSessionIdFromResponse(response);
  if (!sessionId) {
    throw new Error("Expected session cookie from register");
  }

  const session = await validateSessionFromId(sessionId);
  if (!session.user) {
    throw new Error("Expected registered user");
  }

  return { email, sessionId };
}

function authedRequest(url: string, sessionId: string, init?: RequestInit) {
  return new Request(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Cookie: `${SESSION_COOKIE_NAME}=${sessionId}`,
      ...init?.headers,
    },
  });
}

describe("settings integration", () => {
  it("returns and updates the user timezone", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, sessionId } = await registerTestUser();

    try {
      const initialResponse = await getSettings(
        authedRequest("http://localhost/api/v1/settings", sessionId),
      );
      expect(initialResponse.status).toBe(200);
      const initialBody = (await initialResponse.json()) as {
        settings: { timezone: string };
      };
      expect(initialBody.settings.timezone).toBe("UTC");

      const updateResponse = await putSettings(
        authedRequest("http://localhost/api/v1/settings", sessionId, {
          method: "PUT",
          body: JSON.stringify({ timezone: "Europe/Belgrade" }),
        }),
      );

      expect(updateResponse.status).toBe(200);
      const updateBody = (await updateResponse.json()) as {
        settings: { timezone: string };
      };
      expect(updateBody.settings.timezone).toBe("Europe/Belgrade");
    } finally {
      await deleteUserByEmail(getDb(), email);
    }
  });

  it("rejects invalid timezones", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, sessionId } = await registerTestUser();

    try {
      const response = await putSettings(
        authedRequest("http://localhost/api/v1/settings", sessionId, {
          method: "PUT",
          body: JSON.stringify({ timezone: "Not/AZone" }),
        }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as { error: string };
      expect(body.error).toBe("Timezone must be a valid IANA timezone");
    } finally {
      await deleteUserByEmail(getDb(), email);
    }
  });
});
