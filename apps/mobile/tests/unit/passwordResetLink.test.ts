import { describe, expect, it } from "bun:test";
import { parsePasswordResetTokenFromUrl } from "../../src/utils/passwordResetLink";

describe("parsePasswordResetTokenFromUrl", () => {
  it("reads a token from the Tend app scheme", () => {
    expect(parsePasswordResetTokenFromUrl("tend://reset-password?token=abc123")).toBe("abc123");
  });

  it("reads a token from the web reset URL", () => {
    expect(
      parsePasswordResetTokenFromUrl("https://app.tend.qzz.io/reset-password?token=web-token"),
    ).toBe("web-token");
  });

  it("returns null when the token is missing", () => {
    expect(parsePasswordResetTokenFromUrl("https://app.tend.qzz.io/reset-password")).toBeNull();
    expect(parsePasswordResetTokenFromUrl("https://app.tend.qzz.io/login")).toBeNull();
    expect(parsePasswordResetTokenFromUrl("")).toBeNull();
  });

  it("decodes a percent-encoded token", () => {
    expect(parsePasswordResetTokenFromUrl("tend://reset-password?token=abc%2F123")).toBe("abc/123");
  });
});
