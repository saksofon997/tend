import { describe, expect, it } from "bun:test";
import { POST as register } from "@/app/api/v1/auth/register/route";
import {
  DELETE as deleteReflection,
  GET as getReflection,
  PUT as putReflection,
} from "@/app/api/v1/reflections/[date]/route";
import { GET as listReflections } from "@/app/api/v1/reflections/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { validateSessionFromId } from "@/lib/auth/session";
import type { ReflectionResponse } from "@/lib/reflections/serialize";
import { deleteUserByEmail, isDatabaseAvailable } from "@tend/db";
import { REFLECTION_BODY_MAX_LENGTH } from "@tend/domain";
import { unsetEnv } from "../env";

function uniqueEmail(): string {
  return `reflections-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
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
  const password = "password123";

  const response = await register(
    new Request("http://localhost/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Reflections Tester",
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

const dateContext = (date: string) => ({ params: Promise.resolve({ date }) });

describe("reflections integration", () => {
  it("upserts one leaf per day, lists it, and clears a blank page", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { email, sessionId } = await registerTestUser();

    try {
      const missing = await getReflection(
        authedRequest("http://localhost/api/v1/reflections/2026-08-26", sessionId),
        dateContext("2026-08-26"),
      );
      expect(missing.status).toBe(200);
      expect(await missing.json()).toEqual({ entry: null });

      const created = await putReflection(
        authedRequest("http://localhost/api/v1/reflections/2026-08-26", sessionId, {
          method: "PUT",
          body: JSON.stringify({ body: "A quiet morning with the plants." }),
        }),
        dateContext("2026-08-26"),
      );
      expect(created.status).toBe(200);
      const createdBody = (await created.json()) as { entry: ReflectionResponse };
      expect(createdBody.entry.entryDate).toBe("2026-08-26");
      expect(createdBody.entry.body).toBe("A quiet morning with the plants.");

      const updated = await putReflection(
        authedRequest("http://localhost/api/v1/reflections/2026-08-26", sessionId, {
          method: "PUT",
          body: JSON.stringify({ body: "Still the same leaf, rewritten softly." }),
        }),
        dateContext("2026-08-26"),
      );
      expect(updated.status).toBe(200);
      const updatedBody = (await updated.json()) as { entry: ReflectionResponse };
      expect(updatedBody.entry.id).toBe(createdBody.entry.id);
      expect(updatedBody.entry.body).toBe("Still the same leaf, rewritten softly.");

      const listed = await listReflections(
        authedRequest(
          "http://localhost/api/v1/reflections?from=2026-08-01&to=2026-08-31",
          sessionId,
        ),
      );
      expect(listed.status).toBe(200);
      const listBody = (await listed.json()) as { entries: ReflectionResponse[] };
      expect(listBody.entries).toHaveLength(1);
      expect(listBody.entries[0]?.body).toBe("Still the same leaf, rewritten softly.");

      const tooLong = await putReflection(
        authedRequest("http://localhost/api/v1/reflections/2026-08-26", sessionId, {
          method: "PUT",
          body: JSON.stringify({ body: "a".repeat(REFLECTION_BODY_MAX_LENGTH + 1) }),
        }),
        dateContext("2026-08-26"),
      );
      expect(tooLong.status).toBe(400);

      const cleared = await putReflection(
        authedRequest("http://localhost/api/v1/reflections/2026-08-26", sessionId, {
          method: "PUT",
          body: JSON.stringify({ body: "   " }),
        }),
        dateContext("2026-08-26"),
      );
      expect(cleared.status).toBe(200);
      expect(await cleared.json()).toEqual({ entry: null });

      const afterClear = await listReflections(
        authedRequest("http://localhost/api/v1/reflections", sessionId),
      );
      const afterClearBody = (await afterClear.json()) as { entries: ReflectionResponse[] };
      expect(afterClearBody.entries).toHaveLength(0);

      const deleted = await deleteReflection(
        authedRequest("http://localhost/api/v1/reflections/2026-08-01", sessionId, {
          method: "DELETE",
        }),
        dateContext("2026-08-01"),
      );
      expect(deleted.status).toBe(200);
      expect(await deleted.json()).toEqual({ ok: true });

      const invalidDate = await getReflection(
        authedRequest("http://localhost/api/v1/reflections/2026-02-31", sessionId),
        dateContext("2026-02-31"),
      );
      expect(invalidDate.status).toBe(400);
    } finally {
      await deleteUserByEmail((await import("@/lib/db")).getDb(), email);
    }
  });

  it("requires auth", async () => {
    const response = await listReflections(new Request("http://localhost/api/v1/reflections"));
    expect(response.status).toBe(401);
  });
});
