import { beforeEach, describe, expect, it, mock } from "bun:test";
import * as actualDb from "@tend/db";

const findUserByEmail = mock(() => Promise.resolve(null as null | { id: string; email: string }));
const replacePasswordResetToken = mock(() => Promise.resolve({ id: "token-1" }));
const findPasswordResetTokenByHash = mock(() =>
  Promise.resolve(
    null as null | {
      userId: string;
      expiresAt: Date;
    },
  ),
);
const deletePasswordResetTokensForUser = mock(() => Promise.resolve());
const updateUserPasswordHash = mock(() => Promise.resolve());
const deliverEmail = mock(() => Promise.resolve({ delivered: true }));
const invalidateUserSessions = mock(() => Promise.resolve());

mock.module("@tend/db", () => ({
  ...actualDb,
  findUserByEmail,
  replacePasswordResetToken,
  findPasswordResetTokenByHash,
  deletePasswordResetTokensForUser,
  updateUserPasswordHash,
}));

mock.module("@/lib/auth/lucia", () => ({
  lucia: {
    invalidateUserSessions,
  },
}));

mock.module("@/lib/db", () => ({
  getDb: () => ({}),
}));

const { requestPasswordReset, resetPasswordWithToken } = await import("@/lib/auth/password-reset");

describe("requestPasswordReset", () => {
  beforeEach(() => {
    findUserByEmail.mockReset();
    replacePasswordResetToken.mockReset();
    deliverEmail.mockReset();
    findUserByEmail.mockImplementation(() => Promise.resolve(null));
    deliverEmail.mockImplementation(() => Promise.resolve({ delivered: true }));
  });

  it("returns ok without sending mail when the email is unknown", async () => {
    const result = await requestPasswordReset({
      email: "missing@example.com",
      deliverEmail,
    });

    expect(result).toEqual({ ok: true });
    expect(replacePasswordResetToken).not.toHaveBeenCalled();
    expect(deliverEmail).not.toHaveBeenCalled();
  });

  it("creates a token and emails a reset link for a known account", async () => {
    findUserByEmail.mockImplementation(() =>
      Promise.resolve({ id: "user-1", email: "saki@example.com" }),
    );

    const result = await requestPasswordReset({
      email: "saki@example.com",
      locale: "en",
      deliverEmail,
    });

    expect(result).toEqual({ ok: true });
    expect(replacePasswordResetToken).toHaveBeenCalledTimes(1);
    expect(deliverEmail).toHaveBeenCalledTimes(1);
    const message = deliverEmail.mock.calls[0]?.[0] as {
      to: string;
      text: string;
      subject: string;
    };
    expect(message.to).toBe("saki@example.com");
    expect(message.subject).toBe("Reset your Tend password");
    expect(message.text).toContain("/reset-password?token=");
  });

  it("still returns ok when email delivery fails", async () => {
    findUserByEmail.mockImplementation(() =>
      Promise.resolve({ id: "user-1", email: "saki@example.com" }),
    );
    deliverEmail.mockImplementation(() => Promise.reject(new Error("Resend down")));

    await expect(
      requestPasswordReset({ email: "saki@example.com", deliverEmail }),
    ).resolves.toEqual({
      ok: true,
    });
  });
});

describe("resetPasswordWithToken", () => {
  beforeEach(() => {
    findPasswordResetTokenByHash.mockReset();
    deletePasswordResetTokensForUser.mockReset();
    updateUserPasswordHash.mockReset();
    invalidateUserSessions.mockReset();
    findPasswordResetTokenByHash.mockImplementation(() => Promise.resolve(null));
  });

  it("rejects an unknown token", async () => {
    const result = await resetPasswordWithToken({
      token: "missing",
      password: "password123",
    });

    expect(result).toEqual({ error: "invalid" });
    expect(updateUserPasswordHash).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    findPasswordResetTokenByHash.mockImplementation(() =>
      Promise.resolve({
        userId: "user-1",
        expiresAt: new Date("2026-08-19T11:00:00.000Z"),
      }),
    );

    const result = await resetPasswordWithToken({
      token: "expired",
      password: "password123",
      now: new Date("2026-08-19T12:00:00.000Z"),
    });

    expect(result).toEqual({ error: "invalid" });
    expect(updateUserPasswordHash).not.toHaveBeenCalled();
  });

  it("updates the password and invalidates sessions for a valid token", async () => {
    findPasswordResetTokenByHash.mockImplementation(() =>
      Promise.resolve({
        userId: "user-1",
        expiresAt: new Date("2026-08-19T13:00:00.000Z"),
      }),
    );

    const result = await resetPasswordWithToken({
      token: "valid-token",
      password: "password123",
      now: new Date("2026-08-19T12:00:00.000Z"),
    });

    expect(result).toEqual({ ok: true });
    expect(updateUserPasswordHash).toHaveBeenCalled();
    expect(deletePasswordResetTokensForUser).toHaveBeenCalledWith({}, "user-1");
    expect(invalidateUserSessions).toHaveBeenCalledWith("user-1");
  });
});
