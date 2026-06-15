import { describe, expect, it } from "bun:test";
import { ALL_PRESETS, PRESETS_BY_AREA, getPresetsByArea } from "../src/presets";

const EXPECTED_AREAS = [
  "finance",
  "food_kitchen",
  "health",
  "home_maintenance",
  "household",
  "kids_family",
  "life_admin",
  "outdoor",
  "pets",
  "relationships",
  "self_care",
  "vehicle",
] as const;

describe("presets", () => {
  it("includes all twelve preset life areas", () => {
    expect(Object.keys(PRESETS_BY_AREA).sort()).toEqual([...EXPECTED_AREAS]);
  });

  it("includes the original household examples from the MVP spec", () => {
    const names = getPresetsByArea("household").map((preset) => preset.name);
    expect(names).toContain("Change bed sheets");
    expect(names).toContain("Vacuum");
    expect(names).toContain("Clean bathroom");
    expect(names).toContain("Clean AC filter");
  });

  it("provides at least six presets per area", () => {
    for (const area of EXPECTED_AREAS) {
      expect(getPresetsByArea(area).length).toBeGreaterThanOrEqual(6);
    }
  });

  it("provides defaults for every preset", () => {
    for (const preset of ALL_PRESETS) {
      expect(preset.rhythmDays).toBeGreaterThan(0);
      expect(["must", "want"]).toContain(preset.type);
      expect(preset.lifeArea).toBeTruthy();
    }
  });

  it("returns an empty list for personal presets", () => {
    expect(getPresetsByArea("personal")).toEqual([]);
  });
});
