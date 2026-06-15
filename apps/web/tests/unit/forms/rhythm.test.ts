import { describe, expect, it } from "bun:test";
import { rhythmDaysFieldError } from "@/lib/forms/rhythm";
import { isPresetRhythm } from "@/lib/onboarding/constants";

describe("isPresetRhythm", () => {
  it("recognizes common preset intervals", () => {
    expect(isPresetRhythm(7)).toBe(true);
    expect(isPresetRhythm(30)).toBe(true);
  });

  it("treats longer preset catalog rhythms as custom", () => {
    expect(isPresetRhythm(90)).toBe(false);
    expect(isPresetRhythm(180)).toBe(false);
    expect(isPresetRhythm(365)).toBe(false);
  });
});

describe("rhythmDaysFieldError", () => {
  it("accepts values within the supported range", () => {
    expect(rhythmDaysFieldError(1)).toBeNull();
    expect(rhythmDaysFieldError(365)).toBeNull();
    expect(rhythmDaysFieldError(90)).toBeNull();
  });

  it("rejects out-of-range values with calm copy", () => {
    expect(rhythmDaysFieldError(0)).toBe("Rhythm must be at least 1 day");
    expect(rhythmDaysFieldError(366)).toBe("Rhythm must be 365 days or fewer");
    expect(rhythmDaysFieldError(7.5)).toBe("Use a whole number of days");
  });
});
