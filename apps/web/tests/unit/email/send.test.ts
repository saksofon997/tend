import { afterEach, describe, expect, it } from "bun:test";
import {
  RESEND_TEST_FROM_ADDRESS,
  getEmailFromAddress,
  isUsableEmailFromAddress,
  sendEmail,
} from "@/lib/email/send";

const originalFetch = globalThis.fetch;
const originalFrom = process.env.EMAIL_FROM;
const originalKey = process.env.RESEND_API_KEY;

function restoreEmailEnv() {
  process.env.EMAIL_FROM = originalFrom;
  process.env.RESEND_API_KEY = originalKey;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  restoreEmailEnv();
});

describe("email from address", () => {
  it("builds Resend's documented test sender from parts", () => {
    expect(RESEND_TEST_FROM_ADDRESS).toMatch(/^Tend <[a-z]+@resend\.dev>$/);
  });
  it("falls back to Resend's test sender when EMAIL_FROM is missing", () => {
    process.env.EMAIL_FROM = undefined;
    expect(getEmailFromAddress()).toBe(RESEND_TEST_FROM_ADDRESS);
  });

  it("does not use a redacted or empty from address", () => {
    expect(isUsableEmailFromAddress("Tend <[REDACTED]>")).toBe(false);
    expect(isUsableEmailFromAddress("")).toBe(false);
    expect(isUsableEmailFromAddress("   ")).toBe(false);
    expect(isUsableEmailFromAddress(RESEND_TEST_FROM_ADDRESS)).toBe(true);
    expect(isUsableEmailFromAddress("Tend <noreply@app.tend.qzz.io>")).toBe(true);

    process.env.EMAIL_FROM = "Tend <[REDACTED]>";
    expect(getEmailFromAddress()).toBe(RESEND_TEST_FROM_ADDRESS);
  });

  it("keeps a verified-style from address when it is well formed", () => {
    process.env.EMAIL_FROM = "Tend <noreply@app.tend.qzz.io>";
    expect(getEmailFromAddress()).toBe("Tend <noreply@app.tend.qzz.io>");
  });
});

describe("sendEmail", () => {
  const message = {
    to: "saksofon997@gmail.com",
    subject: "Reset your Tend password",
    text: "Reset link",
    html: "<p>Reset link</p>",
  };

  it("retries with the Resend test sender when the configured domain is not verified", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "Tend <noreply@app.tend.qzz.io>";

    const fromAddresses: string[] = [];
    globalThis.fetch = (async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { from: string };
      fromAddresses.push(body.from);

      if (body.from.includes("noreply@app.tend.qzz.io")) {
        return new Response(
          JSON.stringify({
            statusCode: 403,
            name: "validation_error",
            message:
              "The app.tend.qzz.io domain is not verified. Please, add and verify your domain on https://resend.com/domains",
          }),
          { status: 403 },
        );
      }

      return new Response(JSON.stringify({ id: "email-1" }), { status: 200 });
    }) as typeof fetch;

    await expect(sendEmail(message)).resolves.toEqual({ delivered: true });
    expect(fromAddresses).toEqual(["Tend <noreply@app.tend.qzz.io>", RESEND_TEST_FROM_ADDRESS]);
  });

  it("does not retry when Resend rejects the API key", async () => {
    process.env.RESEND_API_KEY = "re_bad_key";
    process.env.EMAIL_FROM = "Tend <noreply@app.tend.qzz.io>";

    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response(
        JSON.stringify({ statusCode: 401, name: "validation_error", message: "Invalid API key" }),
        { status: 401 },
      );
    }) as typeof fetch;

    await expect(sendEmail(message)).rejects.toThrow(/Resend rejected the email \(401\)/);
    expect(calls).toBe(1);
  });
});
