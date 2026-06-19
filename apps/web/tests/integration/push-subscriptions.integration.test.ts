import { describe, expect, it } from "bun:test";
import { POST as register } from "@/app/api/v1/auth/register/route";
import {
  DELETE as deletePushSubscription,
  POST as savePushSubscription,
} from "@/app/api/v1/push-subscriptions/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteUserByEmail, isDatabaseAvailable } from "@tend/db";

function uniqueEmail(): string {
  return `push-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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
        displayName: "Push Tester",
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

describe("push subscriptions integration", () => {
  it("saves and deletes the signed-in user's Expo push token", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, sessionId } = await registerTestUser();
    const token = `ExpoPushToken[${crypto.randomUUID()}]`;

    try {
      const invalidResponse = await savePushSubscription(
        authedRequest("http://localhost/api/v1/push-subscriptions", sessionId, {
          method: "POST",
          body: JSON.stringify({ token: "native-token", platform: "ios" }),
        }),
      );
      expect(invalidResponse.status).toBe(400);

      const saveResponse = await savePushSubscription(
        authedRequest("http://localhost/api/v1/push-subscriptions", sessionId, {
          method: "POST",
          body: JSON.stringify({ token, platform: "ios" }),
        }),
      );
      expect(saveResponse.status).toBe(201);
      const saveBody = (await saveResponse.json()) as {
        subscription: { token: string; platform: string };
      };
      expect(saveBody.subscription).toMatchObject({ token, platform: "ios" });

      const deleteResponse = await deletePushSubscription(
        authedRequest("http://localhost/api/v1/push-subscriptions", sessionId, {
          method: "DELETE",
          body: JSON.stringify({ token }),
        }),
      );
      expect(deleteResponse.status).toBe(200);
      expect(await deleteResponse.json()).toEqual({ ok: true });
    } finally {
      await deleteUserByEmail(getDb(), email);
    }
  });
});
