import { describe, expect, it } from "bun:test";
import { POST as register } from "@/app/api/v1/auth/register/route";
import {
  DELETE as deletePushSubscription,
  POST as savePushSubscription,
} from "@/app/api/v1/push-subscriptions/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import {
  createItemForUser,
  deleteUserByEmail,
  isDatabaseAvailable,
  listPushSubscriptions,
  markPushSubscriptionNotified,
} from "@tend/db";
import { unsetEnv } from "../env";

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
  unsetEnv("ALLOWED_EMAILS");

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
  it("saves and deletes the signed-in user's native FCM push token", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, sessionId } = await registerTestUser();
    const token = `native-fcm-token-${crypto.randomUUID()}`;

    try {
      const invalidResponse = await savePushSubscription(
        authedRequest("http://localhost/api/v1/push-subscriptions", sessionId, {
          method: "POST",
          body: JSON.stringify({ token: "ExpoPushToken[legacy-token]", platform: "ios" }),
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

  it("keeps notification history when the same device token is saved again", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, sessionId } = await registerTestUser();
    const token = `native-fcm-token-${crypto.randomUUID()}`;
    const notifiedAt = new Date("2026-06-15T17:00:00.000Z");

    try {
      const session = await validateSessionFromId(sessionId);
      if (!session.user) {
        throw new Error("Expected registered user");
      }

      const item = await createItemForUser(getDb(), session.user.id, {
        name: "Plants",
        type: "must",
        rhythmDays: 3,
        lastTendedAt: new Date("2026-06-01T12:00:00.000Z"),
        status: "needs_attention",
      });

      const saveResponse = await savePushSubscription(
        authedRequest("http://localhost/api/v1/push-subscriptions", sessionId, {
          method: "POST",
          body: JSON.stringify({ token, platform: "android" }),
        }),
      );
      expect(saveResponse.status).toBe(201);
      const saveBody = (await saveResponse.json()) as { subscription: { id: string } };

      await markPushSubscriptionNotified(getDb(), saveBody.subscription.id, {
        itemId: item.id,
        notifiedAt,
      });

      const refreshResponse = await savePushSubscription(
        authedRequest("http://localhost/api/v1/push-subscriptions", sessionId, {
          method: "POST",
          body: JSON.stringify({ token, platform: "android" }),
        }),
      );
      expect(refreshResponse.status).toBe(201);

      const subscriptions = await listPushSubscriptions(getDb());
      const saved = subscriptions.find((subscription) => subscription.token === token);
      expect(saved?.lastNotifiedItemId).toBe(item.id);
      expect(saved?.lastNotifiedAt?.toISOString()).toBe(notifiedAt.toISOString());
    } finally {
      await deleteUserByEmail(getDb(), email);
    }
  });
});
