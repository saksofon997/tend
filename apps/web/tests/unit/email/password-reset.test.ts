import { describe, expect, it } from "bun:test";
import { buildPasswordResetEmail } from "@/lib/email/password-reset";
import { getEmailFromAddress, hasConfiguredEmailApiKey } from "@/lib/email/send";

describe("password reset email", () => {
  it("builds a calm English reset message with the link", () => {
    const message = buildPasswordResetEmail({
      to: "saki@example.com",
      resetUrl: "https://app.tend.qzz.io/reset-password?token=abc",
      locale: "en",
    });

    expect(message.to).toBe("saki@example.com");
    expect(message.subject).toBe("Reset your Tend password");
    expect(message.text).toContain("https://app.tend.qzz.io/reset-password?token=abc");
    expect(message.text).toContain("one hour");
    expect(message.html).toContain("Choose a new password");
    expect(message.text.toLowerCase()).not.toContain("overdue");
  });

  it("builds a Serbian reset message", () => {
    const message = buildPasswordResetEmail({
      to: "saki@example.com",
      resetUrl: "https://app.tend.qzz.io/reset-password?token=abc",
      locale: "sr",
    });

    expect(message.subject).toBe("Resetuj Tend lozinku");
    expect(message.text).toContain("jedan sat");
  });
});

describe("email delivery configuration", () => {
  it("uses the Tend noreply address by default", () => {
    expect(getEmailFromAddress()).toContain("Tend");
    expect(getEmailFromAddress()).toContain("noreply@");
  });

  it("treats a missing Resend key as unconfigured", () => {
    expect(hasConfiguredEmailApiKey(undefined)).toBe(false);
    expect(hasConfiguredEmailApiKey("")).toBe(false);
    expect(hasConfiguredEmailApiKey("   ")).toBe(false);
    expect(hasConfiguredEmailApiKey("re_test_key")).toBe(true);
  });
});
