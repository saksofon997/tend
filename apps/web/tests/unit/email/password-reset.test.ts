import { describe, expect, it } from "bun:test";
import { escapeHtml } from "@/lib/email/html";
import { buildPasswordResetEmail } from "@/lib/email/password-reset";
import {
  DEFAULT_EMAIL_FROM_ADDRESS,
  getEmailFromAddress,
  hasConfiguredEmailApiKey,
} from "@/lib/email/send";
import { EMAIL_TOKENS } from "@/lib/email/tokens";

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

  it("styles the HTML with Tend surface and sage action colors", () => {
    const message = buildPasswordResetEmail({
      to: "saki@example.com",
      resetUrl: "https://app.tend.qzz.io/reset-password?token=abc",
    });

    expect(message.html).toContain(EMAIL_TOKENS.bg);
    expect(message.html).toContain(EMAIL_TOKENS.primary);
    expect(message.html).toContain(EMAIL_TOKENS.card);
    expect(message.html).toContain(`href="https://app.tend.qzz.io/reset-password?token=abc"`);
    expect(message.html.toLowerCase()).not.toContain("overdue");
  });

  it("escapes a hostile reset URL in HTML", () => {
    const message = buildPasswordResetEmail({
      to: "saki@example.com",
      resetUrl: `https://app.tend.qzz.io/reset-password?token="><script>alert(1)</script>`,
    });

    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&quot;");
    expect(message.html).toContain("&lt;script&gt;");
  });

  it("builds a Serbian reset message", () => {
    const message = buildPasswordResetEmail({
      to: "saki@example.com",
      resetUrl: "https://app.tend.qzz.io/reset-password?token=abc",
      locale: "sr",
    });

    expect(message.subject).toBe("Resetuj Tend lozinku");
    expect(message.text).toContain("jedan sat");
    expect(message.html).toContain('lang="sr"');
  });
});

describe("email HTML escaping", () => {
  it("escapes markup characters", () => {
    expect(escapeHtml(`<a href="x">y</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;y&lt;/a&gt;");
  });
});

describe("email delivery configuration", () => {
  it("uses the marketing-domain noreply address when EMAIL_FROM is not usable", () => {
    expect(getEmailFromAddress("")).toBe(DEFAULT_EMAIL_FROM_ADDRESS);
    expect(getEmailFromAddress("Tend <not-an-address>")).toBe(DEFAULT_EMAIL_FROM_ADDRESS);
  });

  it("treats a missing Resend key as unconfigured", () => {
    expect(hasConfiguredEmailApiKey(undefined)).toBe(false);
    expect(hasConfiguredEmailApiKey("")).toBe(false);
    expect(hasConfiguredEmailApiKey("   ")).toBe(false);
    expect(hasConfiguredEmailApiKey("re_test_key")).toBe(true);
  });
});
