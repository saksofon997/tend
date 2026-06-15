import { describe, expect, it } from "bun:test";
import { ALL_PRESETS, PRESETS_BY_AREA, getPresetsByArea } from "./presets";

describe("presets", () => {
  it("includes all six starter life areas", () => {
    expect(Object.keys(PRESETS_BY_AREA).sort()).toEqual([
      "admin",
      "health",
      "household",
      "pets",
      "relationships",
      "vehicle",
    ]);
  });

  it("includes the household examples from the MVP spec", () => {
    const names = getPresetsByArea("household").map((preset) => preset.name);
    expect(names).toEqual(["Change bed sheets", "Vacuum", "Clean bathroom", "Clean AC filter"]);
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
