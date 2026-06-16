import { LANDING_PROMO_AUTO_ADVANCE_MS } from "@/lib/carousel/auto-advance";

/** Shared PromoCarousel behavior for marketing and onboarding welcome screens. */
export const SHARED_PROMO_CAROUSEL_OPTS = {
  showArrowsOnHover: true,
  autoAdvanceIntervalMs: LANDING_PROMO_AUTO_ADVANCE_MS,
} as const;
