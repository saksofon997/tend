import { describe, expect, it } from "bun:test";
import { GET as getActivity } from "@/app/api/v1/activity/route";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as createItem, GET as getItems } from "@/app/api/v1/items/route";
import { POST as resetTend } from "@/app/api/v1/settings/reset/route";
import { GET as getSettings, PUT as putSettings } from "@/app/api/v1/settings/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteUserByEmail, isDatabaseAvailable } from "@tend/db";
import { unsetEnv } from "../env";

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
  unsetEnv("ALLOWED_EMAILS");

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

  it("does not clear tends without confirmation", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, sessionId } = await registerTestUser();

    try {
      const response = await resetTend(
        authedRequest("http://localhost/api/v1/settings/reset", sessionId, {
          method: "POST",
          body: JSON.stringify({ confirm: false }),
        }),
      );

      expect(response.status).toBe(400);
    } finally {
      await deleteUserByEmail(getDb(), email);
    }
  });

  it("removes the signed-in user's tends and their history", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const owner = await registerTestUser();
    const other = await registerTestUser();

    try {
      const created = await createItem(
        authedRequest("http://localhost/api/v1/items", owner.sessionId, {
          method: "POST",
          body: JSON.stringify({
            name: "Water plants",
            type: "want",
            rhythmDays: 3,
          }),
        }),
      );
      expect(created.status).toBe(201);

      const otherItem = await createItem(
        authedRequest("http://localhost/api/v1/items", other.sessionId, {
          method: "POST",
          body: JSON.stringify({
            name: "Call home",
            type: "want",
            rhythmDays: 7,
          }),
        }),
      );
      expect(otherItem.status).toBe(201);

      const resetResponse = await resetTend(
        authedRequest("http://localhost/api/v1/settings/reset", owner.sessionId, {
          method: "POST",
          body: JSON.stringify({ confirm: true }),
        }),
      );
      expect(resetResponse.status).toBe(200);
      const resetBody = (await resetResponse.json()) as { ok: boolean; deletedItems: number };
      expect(resetBody.ok).toBe(true);
      expect(resetBody.deletedItems).toBe(1);

      const itemsResponse = await getItems(
        authedRequest("http://localhost/api/v1/items", owner.sessionId),
      );
      const itemsBody = (await itemsResponse.json()) as { items: unknown[] };
      expect(itemsBody.items).toEqual([]);

      const activityResponse = await getActivity(
        authedRequest("http://localhost/api/v1/activity", owner.sessionId),
      );
      const activityBody = (await activityResponse.json()) as { events: unknown[] };
      expect(activityBody.events).toEqual([]);

      const otherItemsResponse = await getItems(
        authedRequest("http://localhost/api/v1/items", other.sessionId),
      );
      const otherItemsBody = (await otherItemsResponse.json()) as { items: unknown[] };
      expect(otherItemsBody.items).toHaveLength(1);
    } finally {
      await deleteUserByEmail(getDb(), owner.email);
      await deleteUserByEmail(getDb(), other.email);
    }
  });
});
