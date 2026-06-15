import { describe, expect, it } from "bun:test";
import { DEFAULT_CANONICAL_APP_HOST, isVercelAppHost } from "./canonical-host";

describe("isVercelAppHost", () => {
  it("matches vercel.app hostnames", () => {
    expect(isVercelAppHost("tend.vercel.app")).toBe(true);
    expect(isVercelAppHost("tend-git-main-user.vercel.app")).toBe(true);
  });

  it("does not match the canonical domain or localhost", () => {
    expect(isVercelAppHost(DEFAULT_CANONICAL_APP_HOST)).toBe(false);
    expect(isVercelAppHost("localhost")).toBe(false);
  });
});

describe("DEFAULT_CANONICAL_APP_HOST", () => {
  it("points at the production app subdomain", () => {
    expect(DEFAULT_CANONICAL_APP_HOST).toBe("app.tend.qzz.io");
  });
});
