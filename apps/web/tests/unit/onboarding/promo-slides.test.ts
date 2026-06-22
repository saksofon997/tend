import { describe, expect, it } from "bun:test";
import { ONBOARDING_PROMO_SLIDES } from "@/lib/onboarding/promo-slides";

describe("ONBOARDING_PROMO_SLIDES", () => {
  it("starts with tend-remember.jpg", () => {
    expect(ONBOARDING_PROMO_SLIDES[0]?.src).toBe("/promo/tend-remember.jpg");
  });

  it("includes all promo screenshots in product order", () => {
    expect(ONBOARDING_PROMO_SLIDES.map((slide) => slide.src)).toEqual([
      "/promo/tend-remember.jpg",
      "/promo/tend-care.jpg",
      "/promo/tend-reminder.jpg",
      "/promo/tend-friend-promo.png",
      "/promo/tend-activity.jpg",
    ]);
  });

  it("provides title and description for each slide", () => {
    for (const slide of ONBOARDING_PROMO_SLIDES) {
      expect(slide.title.length).toBeGreaterThan(0);
      expect(slide.description.length).toBeGreaterThan(0);
      expect(slide.alt.length).toBeGreaterThan(0);
    }
  });
});
