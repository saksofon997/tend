import { describe, expect, it } from "bun:test";
import {
  LANDING_POINT_GRID_CLASS,
  LANDING_SECTION_CLASS,
  LANDING_SECTION_INTRO_CLASS,
} from "@/components/marketing/landing-page";

describe("landing page section layout", () => {
  it("uses one section rhythm after the hero", () => {
    expect(LANDING_SECTION_CLASS).toContain("mt-16");
    expect(LANDING_SECTION_CLASS).toContain("border-t");
    expect(LANDING_SECTION_CLASS).toContain("pt-10");
  });

  it("centers section titles and keeps supporting points in a three-column grid", () => {
    expect(LANDING_SECTION_INTRO_CLASS).toContain("mx-auto");
    expect(LANDING_SECTION_INTRO_CLASS).toContain("max-w-2xl");
    expect(LANDING_SECTION_INTRO_CLASS).toContain("text-center");
    expect(LANDING_POINT_GRID_CLASS).toContain("mt-8");
    expect(LANDING_POINT_GRID_CLASS).toContain("sm:grid-cols-3");
  });
});
