import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CANONICAL_APP_HOST,
  DEFAULT_MARKETING_HOST,
  absoluteAppUrl,
  appUrl,
  buildHostRedirectUrl,
  isAppProductionHost,
  isMarketingHost,
  isMarketingLegalPath,
  isMarketingPath,
  isVercelAppHost,
  marketingUrl,
  shouldEnforceHostSplit,
} from "@/lib/canonical-host";

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

describe("production host defaults", () => {
  it("points at the production app and marketing domains", () => {
    expect(DEFAULT_CANONICAL_APP_HOST).toBe("app.tend.qzz.io");
    expect(DEFAULT_MARKETING_HOST).toBe("tend.qzz.io");
  });
});

describe("isMarketingHost", () => {
  it("matches the marketing domain", () => {
    expect(isMarketingHost("tend.qzz.io")).toBe(true);
    expect(isMarketingHost("app.tend.qzz.io")).toBe(false);
  });
});

describe("isAppProductionHost", () => {
  it("matches the app domain", () => {
    expect(isAppProductionHost("app.tend.qzz.io")).toBe(true);
    expect(isAppProductionHost("tend.qzz.io")).toBe(false);
  });
});

describe("shouldEnforceHostSplit", () => {
  it("skips localhost", () => {
    expect(shouldEnforceHostSplit("localhost")).toBe(false);
    expect(shouldEnforceHostSplit("127.0.0.1")).toBe(false);
  });

  it("enforces split on production marketing and app hosts", () => {
    expect(shouldEnforceHostSplit("tend.qzz.io")).toBe(true);
    expect(shouldEnforceHostSplit("app.tend.qzz.io")).toBe(true);
    expect(shouldEnforceHostSplit("tend.vercel.app")).toBe(true);
  });
});

describe("isMarketingPath", () => {
  it("allows the landing page, legal pages, and promo assets", () => {
    expect(isMarketingPath("/")).toBe(true);
    expect(isMarketingPath("/privacy")).toBe(true);
    expect(isMarketingPath("/terms")).toBe(true);
    expect(isMarketingPath("/promo/tend-logo.png")).toBe(true);
    expect(isMarketingPath("/scene/tend-scene-landscape.webp")).toBe(true);
  });

  it("blocks app and auth routes", () => {
    expect(isMarketingPath("/login")).toBe(false);
    expect(isMarketingPath("/register")).toBe(false);
    expect(isMarketingPath("/history")).toBe(false);
    expect(isMarketingPath("/activity")).toBe(false);
    expect(isMarketingPath("/api/v1/health")).toBe(false);
  });
});

describe("isMarketingLegalPath", () => {
  it("matches legal routes only", () => {
    expect(isMarketingLegalPath("/privacy")).toBe(true);
    expect(isMarketingLegalPath("/terms")).toBe(true);
    expect(isMarketingLegalPath("/")).toBe(false);
    expect(isMarketingLegalPath("/login")).toBe(false);
  });
});

describe("buildHostRedirectUrl", () => {
  it("preserves path and query while switching host", () => {
    const request = new Request("http://tend.qzz.io/login?next=%2F");
    const redirectUrl = buildHostRedirectUrl(request, "app.tend.qzz.io");

    expect(redirectUrl.toString()).toBe("https://app.tend.qzz.io/login?next=%2F");
  });
});

describe("appUrl and marketingUrl", () => {
  it("returns relative paths outside production", () => {
    expect(appUrl("/login")).toBe("/login");
    expect(marketingUrl("/privacy")).toBe("/privacy");
  });
});

describe("absoluteAppUrl", () => {
  it("builds a local reset URL outside production", () => {
    expect(absoluteAppUrl("/reset-password?token=abc")).toBe(
      "http://localhost:3000/reset-password?token=abc",
    );
  });
});
