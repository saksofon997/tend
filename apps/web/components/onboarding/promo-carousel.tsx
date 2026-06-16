"use client";

import { nextCarouselIndex } from "@/lib/carousel/auto-advance";
import type { OnboardingPromoSlide } from "@/lib/onboarding/promo-slides";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface PromoCarouselProps {
  slides: readonly OnboardingPromoSlide[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  imageSizes?: string;
  showArrowsOnHover?: boolean;
  autoAdvanceIntervalMs?: number;
}

const carouselArrowClassName =
  "absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-sm transition-[color,opacity] hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function PromoCarousel({
  slides,
  activeIndex,
  onActiveIndexChange,
  imageSizes = "(max-width: 480px) 100vw, 30rem",
  showArrowsOnHover = false,
  autoAdvanceIntervalMs,
}: PromoCarouselProps) {
  const slideCount = slides.length;

  function goTo(index: number) {
    const wrapped = (index + slideCount) % slideCount;
    onActiveIndexChange(wrapped);
  }

  useEffect(() => {
    if (!autoAdvanceIntervalMs || slideCount <= 1) return;

    const timerId = window.setInterval(() => {
      onActiveIndexChange(nextCarouselIndex(activeIndex, slideCount));
    }, autoAdvanceIntervalMs);

    return () => window.clearInterval(timerId);
  }, [activeIndex, autoAdvanceIntervalMs, onActiveIndexChange, slideCount]);

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("relative shrink-0", showArrowsOnHover && "group")}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-[var(--tend-bg-muted)]">
          {slides.map((entry, index) => (
            <Image
              key={entry.src}
              src={entry.src}
              alt={index === activeIndex ? entry.alt : ""}
              fill
              priority={index === 0}
              sizes={imageSizes}
              aria-hidden={index !== activeIndex}
              className={cn(
                "object-contain transition-opacity duration-[var(--tend-duration-slow)] ease-[var(--tend-ease)] motion-reduce:transition-none",
                index === activeIndex ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
        </div>

        {slideCount > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className={cn(
                carouselArrowClassName,
                "left-2",
                showArrowsOnHover &&
                  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className={cn(
                carouselArrowClassName,
                "right-2",
                showArrowsOnHover &&
                  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
              )}
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
