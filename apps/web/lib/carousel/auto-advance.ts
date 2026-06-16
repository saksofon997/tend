export const LANDING_PROMO_AUTO_ADVANCE_MS = 5_000;

export function nextCarouselIndex(currentIndex: number, slideCount: number): number {
  if (slideCount <= 1) return currentIndex;
  return (currentIndex + 1) % slideCount;
}
