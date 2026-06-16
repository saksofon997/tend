import { describe, expect, it } from "bun:test";
import { nextCarouselIndex } from "@/lib/carousel/auto-advance";

describe("nextCarouselIndex", () => {
  it("advances to the next slide", () => {
    expect(nextCarouselIndex(0, 4)).toBe(1);
    expect(nextCarouselIndex(2, 4)).toBe(3);
  });

  it("wraps from the last slide to the first", () => {
    expect(nextCarouselIndex(3, 4)).toBe(0);
  });

  it("does not advance when there is only one slide", () => {
    expect(nextCarouselIndex(0, 1)).toBe(0);
  });
});
