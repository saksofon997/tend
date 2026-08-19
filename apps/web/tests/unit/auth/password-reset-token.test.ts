import { describe, expect, it } from "bun:test";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  isPasswordResetExpired,
  passwordResetExpiry,
} from "@/lib/auth/password-reset-token";

describe("password reset tokens", () => {
  it("hashes tokens without storing the original value", () => {
    const token = generatePasswordResetToken();

    expect(token).toHaveLength(64);
    expect(hashPasswordResetToken(token)).not.toBe(token);
    expect(hashPasswordResetToken(token)).toBe(hashPasswordResetToken(token));
    expect(hashPasswordResetToken("other-token")).not.toBe(hashPasswordResetToken(token));
  });

  it("expires tokens after one hour", () => {
    const now = new Date("2026-08-19T12:00:00.000Z");
    const expiresAt = passwordResetExpiry(now);

    expect(isPasswordResetExpired(expiresAt, now)).toBe(false);
    expect(isPasswordResetExpired(expiresAt, new Date("2026-08-19T12:59:59.000Z"))).toBe(false);
    expect(isPasswordResetExpired(expiresAt, new Date("2026-08-19T13:00:00.000Z"))).toBe(true);
  });
});
