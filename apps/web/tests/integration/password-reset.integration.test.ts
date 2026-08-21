import { afterEach, describe, expect, it, mock } from "bun:test";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { getDb } from "@/lib/db";
import { deleteUserByEmail, isDatabaseAvailable } from "@tend/db";

const sentEmails: Array<{ to: string; text: string }> = [];

mock.module("@/lib/email/send", () => ({
  RESEND_TEST_FROM_ADDRESS: "Tend <test-sender@example.com>",
  sendEmail: async (message: { to: string; text: string }) => {
    sentEmails.push({ to: message.to, text: message.text });
    return { delivered: true };
  },
  getEmailFromAddress: () => "Tend <noreply@app.tend.qzz.io>",
  isUsableEmailFromAddress: (value: string | undefined) => Boolean(value?.includes("@")),
  isEmailDeliveryConfigured: () => true,
  hasConfiguredEmailApiKey: (apiKey: string | undefined) => Boolean(apiKey?.trim()),
}));

const { POST: forgotPassword } = await import("@/app/api/v1/auth/forgot-password/route");
const { POST: resetPassword } = await import("@/app/api/v1/auth/reset-password/route");

function uniqueEmail(): string {
  return `reset-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function tokenFromEmail(text: string): string | null {
  const match = text.match(/[?&]token=([^&\s]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

describe("password reset integration", () => {
  afterEach(() => {
    sentEmails.length = 0;
  });

  it("resets a password from a emailed token and signs in with the new password", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available (start Docker with docker compose up -d)");
      return;
    }

    const email = uniqueEmail();

    try {
      const registerResponse = await register(
        new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: "Reset User",
            email,
            password: "old-password",
          }),
        }),
      );
      expect(registerResponse.status).toBe(201);

      const forgotResponse = await forgotPassword(
        new Request("http://localhost/api/v1/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, locale: "en" }),
        }),
      );
      expect(forgotResponse.status).toBe(200);
      expect(await forgotResponse.json()).toEqual({ ok: true });

      const token = tokenFromEmail(sentEmails[0]?.text ?? "");
      expect(token).toBeTruthy();

      const resetResponse = await resetPassword(
        new Request("http://localhost/api/v1/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: "new-password" }),
        }),
      );
      expect(resetResponse.status).toBe(200);

      const oldLogin = await login(
        new Request("http://localhost/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: "old-password" }),
        }),
      );
      expect(oldLogin.status).toBe(401);

      const newLogin = await login(
        new Request("http://localhost/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: "new-password" }),
        }),
      );
      expect(newLogin.status).toBe(200);
    } finally {
      await deleteUserByEmail(getDb(), email);
    }
  });

  it("returns the same success payload for an unknown email", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available (start Docker with docker compose up -d)");
      return;
    }

    const response = await forgotPassword(
      new Request("http://localhost/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "missing@example.com" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(sentEmails).toEqual([]);
  });

  it("rejects an invalid reset token", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available (start Docker with docker compose up -d)");
      return;
    }

    const response = await resetPassword(
      new Request("http://localhost/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "not-a-real-token", password: "password123" }),
      }),
    );

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("This reset link is invalid or has expired");
  });
});
