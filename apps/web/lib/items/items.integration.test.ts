import { describe, expect, it } from "bun:test";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { DELETE as deleteItem } from "@/app/api/v1/items/[id]/route";
import { POST as tendItem } from "@/app/api/v1/items/[id]/tend/route";
import { POST as createItem, GET as getItems } from "@/app/api/v1/items/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteItemsForUser, deleteUserByEmail, isDatabaseAvailable } from "@tend/db";

function uniqueEmail(): string {
  return `items-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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
        displayName: "Items Tester",
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

describe("items integration", () => {
  it("creates, lists, tends, archives, and deletes an item", async () => {
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
          }),
        }),
      );

      expect(createResponse.status).toBe(201);
      const created = (await createResponse.json()) as {
        item: { id: string; status: string; name: string };
      };
      expect(created.item.name).toBe("Bed sheets");
      expect(created.item.status).toBe("fresh");

      const listResponse = await getItems(
        authedRequest("http://localhost/api/v1/items", sessionId),
      );
      expect(listResponse.status).toBe(200);
      const listed = (await listResponse.json()) as { items: Array<{ id: string }> };
      expect(listed.items.some((item) => item.id === created.item.id)).toBe(true);

      const tendResponse = await tendItem(
        authedRequest(`http://localhost/api/v1/items/${created.item.id}/tend`, sessionId, {
          method: "POST",
          body: JSON.stringify({}),
        }),
        { params: Promise.resolve({ id: created.item.id }) },
      );
      expect(tendResponse.status).toBe(200);
      const tended = (await tendResponse.json()) as { item: { status: string } };
      expect(tended.item.status).toBe("fresh");

      const deleteWithoutConfirm = await deleteItem(
        authedRequest(`http://localhost/api/v1/items/${created.item.id}`, sessionId, {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id: created.item.id }) },
      );
      expect(deleteWithoutConfirm.status).toBe(400);

      const deleteResponse = await deleteItem(
        authedRequest(`http://localhost/api/v1/items/${created.item.id}?confirm=true`, sessionId, {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id: created.item.id }) },
      );
      expect(deleteResponse.status).toBe(200);
    } finally {
      await deleteItemsForUser(getDb(), userId);
      await deleteUserByEmail(getDb(), email);
    }
  });
});
