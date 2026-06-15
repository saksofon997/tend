import { describe, expect, it } from "bun:test";
import { DELETE as deleteEvent, PATCH as patchEvent } from "@/app/api/v1/activity/[eventId]/route";
import { GET as getActivity } from "@/app/api/v1/activity/route";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as tendItem } from "@/app/api/v1/items/[id]/tend/route";
import { POST as createItem } from "@/app/api/v1/items/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteItemsForUser, deleteUserByEmail, isDatabaseAvailable } from "@tend/db";

function uniqueEmail(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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
  const email = uniqueEmail();
  const password = "password123";

  const response = await register(
    new Request("http://localhost/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Activity Tester",
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

describe("activity list integration", () => {
  it("lists recent tending events across items", async () => {
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
            name: "Water plants",
            type: "want",
            rhythmDays: 7,
          }),
        }),
      );
      expect(createResponse.status).toBe(201);
      const { item } = (await createResponse.json()) as { item: { id: string } };

      const tendResponse = await tendItem(
        authedRequest(`http://localhost/api/v1/items/${item.id}/tend`, sessionId, {
          method: "POST",
          body: JSON.stringify({}),
        }),
        { params: Promise.resolve({ id: item.id }) },
      );
      expect(tendResponse.status).toBe(200);

      const listResponse = await getActivity(
        authedRequest("http://localhost/api/v1/activity", sessionId),
      );
      expect(listResponse.status).toBe(200);

      const body = (await listResponse.json()) as {
        events: Array<{ itemName: string; itemId: string }>;
      };

      expect(body.events.length).toBeGreaterThanOrEqual(1);
      expect(body.events[0]?.itemName).toBe("Water plants");
      expect(body.events[0]?.itemId).toBe(item.id);
    } finally {
      await deleteItemsForUser(getDb(), userId);
      await deleteUserByEmail(getDb(), email);
    }
  });

  it("rejects unauthenticated activity requests", async () => {
    const response = await getActivity(new Request("http://localhost/api/v1/activity"));
    expect(response.status).toBe(401);
  });
});
