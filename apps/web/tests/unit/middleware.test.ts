import { describe, expect, it } from "bun:test";
import {
  allowsUnauthenticatedAccess,
  isPublicPath,
  isStaticAssetPath,
} from "@/lib/auth/public-access";

describe("isStaticAssetPath", () => {
  it("allows promo logo assets without auth", () => {
    expect(isStaticAssetPath("/promo/tend-logo.png")).toBe(true);
    expect(isStaticAssetPath("/promo/tend-logo.svg")).toBe(true);
  });

  it("does not treat app routes as static assets", () => {
    expect(isStaticAssetPath("/login")).toBe(false);
    expect(isStaticAssetPath("/items/abc")).toBe(false);
  });
});

describe("allowsUnauthenticatedAccess", () => {
  it("allows auth pages, public shell routes, and static promo assets", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/privacy")).toBe(true);
    expect(isPublicPath("/terms")).toBe(true);
    expect(allowsUnauthenticatedAccess("/login")).toBe(true);
    expect(allowsUnauthenticatedAccess("/")).toBe(true);
    expect(allowsUnauthenticatedAccess("/privacy")).toBe(true);
    expect(allowsUnauthenticatedAccess("/terms")).toBe(true);
    expect(allowsUnauthenticatedAccess("/promo/tend-logo.png")).toBe(true);
  });

  it("blocks protected app routes", () => {
    expect(allowsUnauthenticatedAccess("/activity")).toBe(false);
    expect(allowsUnauthenticatedAccess("/items/abc")).toBe(false);
    expect(allowsUnauthenticatedAccess("/onboarding")).toBe(false);
  });
});
