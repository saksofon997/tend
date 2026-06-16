import { describe, expect, it } from "bun:test";
import { lifeAreaFilterToggleLabel } from "@/components/tend/life-area-filter";

describe("lifeAreaFilterToggleLabel", () => {
  it("prompts to open the filter when nothing is selected", () => {
    expect(lifeAreaFilterToggleLabel(null)).toBe("Filter by area?");
  });

  it("shows the active life area while collapsed", () => {
    expect(lifeAreaFilterToggleLabel("health")).toBe("Filter by area · Health");
  });
});
