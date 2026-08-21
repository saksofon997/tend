import { afterEach, describe, expect, it } from "bun:test";
import { isEmailAllowed, isRegistrationRestricted } from "@/lib/auth/allowed-emails";
import { restoreEnv, unsetEnv } from "../../env";

const originalAllowedEmails = process.env.ALLOWED_EMAILS;

afterEach(() => {
  restoreEnv("ALLOWED_EMAILS", originalAllowedEmails);
});

describe("allowed emails", () => {
  it("allows any email when ALLOWED_EMAILS is unset", () => {
    unsetEnv("ALLOWED_EMAILS");

    expect(isRegistrationRestricted()).toBe(false);
    expect(isEmailAllowed("anyone@example.com")).toBe(true);
  });

  it("allows any email when ALLOWED_EMAILS is empty", () => {
    process.env.ALLOWED_EMAILS = "  ,  ";

    expect(isRegistrationRestricted()).toBe(false);
    expect(isEmailAllowed("anyone@example.com")).toBe(true);
  });

  it("restricts to listed emails when ALLOWED_EMAILS is set", () => {
    process.env.ALLOWED_EMAILS = " Alpha@Example.com , beta@example.com ";

    expect(isRegistrationRestricted()).toBe(true);
    expect(isEmailAllowed("alpha@example.com")).toBe(true);
    expect(isEmailAllowed("beta@example.com")).toBe(true);
    expect(isEmailAllowed("gamma@example.com")).toBe(false);
  });
});
