"use client";

import type { OnboardingPromoSlide } from "@/lib/onboarding/promo-slides";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface PromoCarouselProps {
  slides: readonly OnboardingPromoSlide[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  imageSizes?: string;
}

export function PromoCarousel({
  slides,
  activeIndex,
  onActiveIndexChange,
  imageSizes = "(max-width: 480px) 100vw, 30rem",
}: PromoCarouselProps) {
  const slide = slides[activeIndex];
  const slideCount = slides.length;

  function goTo(index: number) {
    const wrapped = (index + slideCount) % slideCount;
    onActiveIndexChange(wrapped);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative shrink-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-[var(--tend-bg-muted)]">
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={activeIndex === 0}
            sizes={imageSizes}
            className="object-contain"
          />
        </div>

        {slideCount > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {slideCount > 1 ? (
        <div
          className="flex shrink-0 justify-center gap-2"
          role="tablist"
          aria-label="Product preview slides"
        >
          {slides.map((entry, index) => (
            <button
              key={entry.src}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Slide ${index + 1} of ${slideCount}: ${entry.title}`}
              onClick={() => onActiveIndexChange(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                index === activeIndex ? "bg-primary" : "bg-[var(--tend-bg-muted)]",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
