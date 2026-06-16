"use client";

import { PromoCarousel } from "@/components/onboarding/promo-carousel";
import { LANDING_PROMO_AUTO_ADVANCE_MS } from "@/lib/carousel/auto-advance";
import { ONBOARDING_PROMO_SLIDES } from "@/lib/onboarding/promo-slides";
import { useState } from "react";

export function LandingPromoPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = ONBOARDING_PROMO_SLIDES[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="shrink-0">
        <PromoCarousel
          slides={ONBOARDING_PROMO_SLIDES}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          imageSizes="(max-width: 1024px) 100vw, 34rem"
          showArrowsOnHover
          autoAdvanceIntervalMs={LANDING_PROMO_AUTO_ADVANCE_MS}
        />
      </div>
      <div
        key={activeIndex}
        aria-live="polite"
        className="tend-carousel-caption shrink-0 text-center lg:text-left"
      >
        <p className="h-[2.75rem] font-display text-base font-medium leading-snug text-foreground">
          {slide.title}
        </p>
        <p className="h-[3rem] text-sm leading-relaxed text-muted-foreground">
          {slide.description}
        </p>
      </div>
    </div>
  );
}
