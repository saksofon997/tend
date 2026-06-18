import { describe, expect, it } from "bun:test";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { GET as getAvailability, PUT as putAvailability } from "@/app/api/v1/availability/route";
import { POST as createItem } from "@/app/api/v1/items/route";
import { GET as getReminders } from "@/app/api/v1/reminders/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import {
  deleteAvailabilityWindowsForUser,
  deleteItemsForUser,
  deleteUserByEmail,
  isDatabaseAvailable,
} from "@tend/db";

function uniqueEmail(): string {
  return `availability-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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
  const password = "password123";

  const response = await register(
    new Request("http://localhost/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Availability Tester",
        email,
        password,
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

  return { email, userId: session.user.id, sessionId };
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

describe("availability integration", () => {
  it("stores and replaces weekly windows", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, userId, sessionId } = await registerTestUser();

    try {
      const emptyResponse = await getAvailability(
        authedRequest("http://localhost/api/v1/availability", sessionId),
      );
      expect(emptyResponse.status).toBe(200);
      const emptyBody = (await emptyResponse.json()) as { windows: unknown[] };
      expect(emptyBody.windows).toHaveLength(0);

      const putResponse = await putAvailability(
        authedRequest("http://localhost/api/v1/availability", sessionId, {
          method: "PUT",
          body: JSON.stringify({
            windows: [
              { dayOfWeek: 1, startTime: "18:00", endTime: "22:00" },
              { dayOfWeek: 3, startTime: "09:00", endTime: "12:00" },
            ],
          }),
        }),
      );

      expect(putResponse.status).toBe(200);
      const putBody = (await putResponse.json()) as {
        windows: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
      };
      expect(putBody.windows).toHaveLength(2);
      expect(putBody.windows[0]).toMatchObject({
        dayOfWeek: 1,
        startTime: "18:00",
        endTime: "22:00",
      });

      const replaceResponse = await putAvailability(
        authedRequest("http://localhost/api/v1/availability", sessionId, {
          method: "PUT",
          body: JSON.stringify({
            windows: [{ dayOfWeek: 0, startTime: "10:00", endTime: "11:00" }],
          }),
        }),
      );

      expect(replaceResponse.status).toBe(200);
      const replaceBody = (await replaceResponse.json()) as { windows: unknown[] };
      expect(replaceBody.windows).toHaveLength(1);

      const clearResponse = await putAvailability(
        authedRequest("http://localhost/api/v1/availability", sessionId, {
          method: "PUT",
          body: JSON.stringify({ windows: [] }),
        }),
      );

      expect(clearResponse.status).toBe(200);
      const clearBody = (await clearResponse.json()) as { windows: unknown[] };
      expect(clearBody.windows).toHaveLength(0);
    } finally {
      await deleteAvailabilityWindowsForUser(getDb(), userId);
      await deleteItemsForUser(getDb(), userId);
      await deleteUserByEmail(getDb(), email);
    }
  });
});

describe("reminders integration", () => {
  it("surfaces must reminders and defers wants outside windows", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, userId, sessionId } = await registerTestUser();
    const futureDayOfWeek = (new Date().getUTCDay() + 3) % 7;

    try {
      await putAvailability(
        authedRequest("http://localhost/api/v1/availability", sessionId, {
          method: "PUT",
          body: JSON.stringify({
            windows: [{ dayOfWeek: futureDayOfWeek, startTime: "18:00", endTime: "22:00" }],
          }),
        }),
      );

      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 30);

      const mustResponse = await createItem(
        authedRequest("http://localhost/api/v1/items", sessionId, {
          method: "POST",
          body: JSON.stringify({
            name: "Medication",
            type: "must",
            rhythmDays: 7,
            lastTendedAt: staleDate.toISOString(),
          }),
        }),
      );
      expect(mustResponse.status).toBe(201);

      const wantResponse = await createItem(
        authedRequest("http://localhost/api/v1/items", sessionId, {
          method: "POST",
          body: JSON.stringify({
            name: "Bed sheets",
            type: "want",
            rhythmDays: 7,
            lastTendedAt: staleDate.toISOString(),
          }),
        }),
      );
      expect(wantResponse.status).toBe(201);

      const remindersResponse = await getReminders(
        authedRequest("http://localhost/api/v1/reminders", sessionId),
      );
      expect(remindersResponse.status).toBe(200);

      const body = (await remindersResponse.json()) as {
        reminders: Array<{ name: string; visibility: string }>;
        surfaceNow: Array<{ name: string }>;
      };

      expect(body.reminders.map((reminder) => reminder.name)).toEqual(["Medication", "Bed sheets"]);
      expect(body.reminders.map((reminder) => reminder.visibility)).toEqual(["now", "next_window"]);
      expect(body.surfaceNow.map((reminder) => reminder.name)).toEqual(["Medication"]);
    } finally {
      await deleteAvailabilityWindowsForUser(getDb(), userId);
      await deleteItemsForUser(getDb(), userId);
      await deleteUserByEmail(getDb(), email);
    }
  });
});
