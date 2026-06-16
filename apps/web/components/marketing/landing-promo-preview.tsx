"use client";

import { PromoCarousel } from "@/components/onboarding/promo-carousel";
import { PROMO_CAPTION_DESCRIPTION_CLASS } from "@/lib/carousel/promo-caption-layout";
import { SHARED_PROMO_CAROUSEL_OPTS } from "@/lib/carousel/promo-carousel-config";
import { ONBOARDING_PROMO_SLIDES } from "@/lib/onboarding/promo-slides";
import { cn } from "@/lib/utils";
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
          {...SHARED_PROMO_CAROUSEL_OPTS}
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
        <p
          className={cn(
            "text-sm leading-relaxed text-muted-foreground",
            PROMO_CAPTION_DESCRIPTION_CLASS,
          )}
        >
          {slide.description}
        </p>
      </div>
    </div>
  );
}
