import { describe, expect, it } from "bun:test";
import {
  PROMO_CAPTION_DESCRIPTION_CLASS,
  PROMO_CAPTION_TITLE_CLASS,
} from "@/lib/carousel/promo-caption-layout";

describe("promo caption layout", () => {
  it("reserves two lines for titles and three for descriptions", () => {
    expect(PROMO_CAPTION_TITLE_CLASS).toContain("line-clamp-2");
    expect(PROMO_CAPTION_DESCRIPTION_CLASS).toContain("line-clamp-3");
  });

  it("uses matching fixed heights so captions do not shift surrounding layout", () => {
    expect(PROMO_CAPTION_TITLE_CLASS).toContain("h-[4.5rem]");
    expect(PROMO_CAPTION_DESCRIPTION_CLASS).toContain("h-[4.5rem]");
  });
});
