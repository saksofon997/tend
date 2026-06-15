import { describe, expect, it } from "bun:test";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { PUT as completeOnboarding, GET as getOnboarding } from "@/app/api/v1/onboarding/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getDb } from "@/lib/db";
import { deleteUserByEmail, isDatabaseAvailable } from "@tend/db";

function uniqueEmail(): string {
  return `onboarding-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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

describe("onboarding integration", () => {
  it("starts incomplete and can be marked complete", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const email = uniqueEmail();
    const registerResponse = await register(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: "Onboarding Tester",
          email,
          password: "password123",
        }),
      }),
    );

    const sessionId = getSessionIdFromResponse(registerResponse);
    expect(sessionId).toBeTruthy();

    try {
      const statusResponse = await getOnboarding(
        authedRequest("http://localhost/api/v1/onboarding", sessionId as string),
      );
      expect(statusResponse.status).toBe(200);
      const status = (await statusResponse.json()) as { completed: boolean };
      expect(status.completed).toBe(false);

      const completeResponse = await completeOnboarding(
        authedRequest("http://localhost/api/v1/onboarding", sessionId as string, {
          method: "PUT",
          body: JSON.stringify({ completed: true }),
        }),
      );
      expect(completeResponse.status).toBe(200);
      const completed = (await completeResponse.json()) as {
        completed: boolean;
        onboardingCompletedAt: string | null;
      };
      expect(completed.completed).toBe(true);
      expect(completed.onboardingCompletedAt).toBeTruthy();
    } finally {
      await deleteUserByEmail(getDb(), email);
    }
  });
});
