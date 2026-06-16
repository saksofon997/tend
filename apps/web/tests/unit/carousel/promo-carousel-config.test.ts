import { describe, expect, it } from "bun:test";
import { LANDING_PROMO_AUTO_ADVANCE_MS } from "@/lib/carousel/auto-advance";
import { SHARED_PROMO_CAROUSEL_OPTS } from "@/lib/carousel/promo-carousel-config";

describe("SHARED_PROMO_CAROUSEL_OPTS", () => {
  it("auto-advances on the landing interval", () => {
    expect(SHARED_PROMO_CAROUSEL_OPTS.autoAdvanceIntervalMs).toBe(LANDING_PROMO_AUTO_ADVANCE_MS);
  });

  it("reveals arrows on hover instead of showing them by default", () => {
    expect(SHARED_PROMO_CAROUSEL_OPTS.showArrowsOnHover).toBe(true);
  });
});
