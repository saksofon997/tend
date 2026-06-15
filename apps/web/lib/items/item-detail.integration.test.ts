import { describe, expect, it } from "bun:test";
import { DELETE as deleteEvent, PATCH as patchEvent } from "@/app/api/v1/activity/[eventId]/route";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { GET as getItem, PATCH as patchItem } from "@/app/api/v1/items/[id]/route";
import { POST as tendItem } from "@/app/api/v1/items/[id]/tend/route";
import { POST as createItem } from "@/app/api/v1/items/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteItemsForUser, deleteUserByEmail, isDatabaseAvailable } from "@tend/db";

function uniqueEmail(): string {
  return `detail-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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
        displayName: "Detail Tester",
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

describe("item detail and activity integration", () => {
  it("returns item detail, edits item, and corrects tend events", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, userId, sessionId } = await registerTestUser();

    try {
      const createResponse = await createItem(
        authedRequest("http://localhost/api/v1/items", sessionId, {
          method: "POST",
          body: JSON.stringify({
            name: "Bed sheets",
            type: "must",
            rhythmDays: 7,
            lifeArea: "household",
            lastTendedAt: "2026-06-01T12:00:00.000Z",
          }),
        }),
      );

      expect(createResponse.status).toBe(201);
      const created = (await createResponse.json()) as { item: { id: string; name: string } };

      const detailResponse = await getItem(
        authedRequest(`http://localhost/api/v1/items/${created.item.id}`, sessionId),
        { params: Promise.resolve({ id: created.item.id }) },
      );
      expect(detailResponse.status).toBe(200);
      const detail = (await detailResponse.json()) as {
        item: { name: string; status: string };
        recentEvents: Array<{ id: string }>;
      };
      expect(detail.item.name).toBe("Bed sheets");
      expect(detail.recentEvents.length).toBeGreaterThan(0);

      const patchResponse = await patchItem(
        authedRequest(`http://localhost/api/v1/items/${created.item.id}`, sessionId, {
          method: "PATCH",
          body: JSON.stringify({ name: "Sheets" }),
        }),
        { params: Promise.resolve({ id: created.item.id }) },
      );
      expect(patchResponse.status).toBe(200);
      const patched = (await patchResponse.json()) as { item: { name: string } };
      expect(patched.item.name).toBe("Sheets");

      const tendResponse = await tendItem(
        authedRequest(`http://localhost/api/v1/items/${created.item.id}/tend`, sessionId, {
          method: "POST",
          body: JSON.stringify({ tendedAt: "2026-06-14T12:00:00.000Z" }),
        }),
        { params: Promise.resolve({ id: created.item.id }) },
      );
      expect(tendResponse.status).toBe(200);
      const tended = (await tendResponse.json()) as { event: { id: string } };

      const correctedResponse = await patchEvent(
        authedRequest(`http://localhost/api/v1/activity/${tended.event.id}`, sessionId, {
          method: "PATCH",
          body: JSON.stringify({ tendedAt: "2026-06-13T12:00:00.000Z" }),
        }),
        { params: Promise.resolve({ eventId: tended.event.id }) },
      );
      expect(correctedResponse.status).toBe(200);
      const corrected = (await correctedResponse.json()) as {
        item: { lastTendedAt: string };
        event: { tendedAt: string };
      };
      expect(corrected.event.tendedAt).toBe("2026-06-13T12:00:00.000Z");
      expect(corrected.item.lastTendedAt).toBe("2026-06-13T12:00:00.000Z");

      const deleteResponse = await deleteEvent(
        authedRequest(`http://localhost/api/v1/activity/${tended.event.id}`, sessionId, {
          method: "DELETE",
        }),
        { params: Promise.resolve({ eventId: tended.event.id }) },
      );
      expect(deleteResponse.status).toBe(200);
      const deleted = (await deleteResponse.json()) as { item: { lastTendedAt: string } };
      expect(deleted.item.lastTendedAt).toBe("2026-06-01T12:00:00.000Z");
    } finally {
      await deleteItemsForUser(getDb(), userId);
      await deleteUserByEmail(getDb(), email);
    }
  });
});
