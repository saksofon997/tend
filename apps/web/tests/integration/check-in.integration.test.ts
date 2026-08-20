import { describe, expect, it } from "bun:test";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { GET as getCheckIn } from "@/app/api/v1/check-in/route";
import { POST as tendItem } from "@/app/api/v1/items/[id]/tend/route";
import { POST as createItem } from "@/app/api/v1/items/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteItemsForUser, deleteUserByEmail, isDatabaseAvailable } from "@tend/db";
import type { CheckInSummary } from "@tend/domain";

function uniqueEmail(): string {
  return `check-in-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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
        displayName: "Check In Tester",
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

describe("check-in integration", () => {
  it("summarizes recent tending for the selected period", async () => {
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
            name: "Journal",
            type: "want",
            rhythmDays: 7,
            lifeArea: "self_care",
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

      const weekResponse = await getCheckIn(
        authedRequest("http://localhost/api/v1/check-in?period=week", sessionId),
      );
      expect(weekResponse.status).toBe(200);
      const weekBody = (await weekResponse.json()) as {
        period: string;
        summary: CheckInSummary;
      };

      expect(weekBody.period).toBe("week");
      expect(weekBody.summary.totalTends).toBeGreaterThanOrEqual(1);
      expect(weekBody.summary.careDays).toBeGreaterThanOrEqual(1);
      expect(weekBody.summary.mostTendedItem?.name).toBe("Journal");

      const invalidResponse = await getCheckIn(
        authedRequest("http://localhost/api/v1/check-in?period=year", sessionId),
      );
      expect(invalidResponse.status).toBe(400);
    } finally {
      await deleteItemsForUser(getDb(), userId);
      await deleteUserByEmail(getDb(), email);
    }
  });

  it("rejects unauthenticated check-in requests", async () => {
    const response = await getCheckIn(new Request("http://localhost/api/v1/check-in"));
    expect(response.status).toBe(401);
  });
});
