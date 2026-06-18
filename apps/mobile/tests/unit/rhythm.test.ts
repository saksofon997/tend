import { describe, expect, it } from "bun:test";
import { RHYTHM_OPTIONS, isPresetRhythm } from "../../src/constants";
import { rhythmDaysFieldError } from "../../src/utils/rhythm";

describe("rhythm helpers", () => {
  it("detects preset rhythm values", () => {
    expect(isPresetRhythm(7, RHYTHM_OPTIONS)).toBe(true);
    expect(isPresetRhythm(9, RHYTHM_OPTIONS)).toBe(false);
  });

  it("validates rhythm day bounds", () => {
    expect(rhythmDaysFieldError(1)).toBeNull();
    expect(rhythmDaysFieldError(365)).toBeNull();
    expect(rhythmDaysFieldError(0)).toBe("Rhythm must be at least 1 day");
    expect(rhythmDaysFieldError(366)).toBe("Rhythm must be 365 days or fewer");
    expect(rhythmDaysFieldError(7.5)).toBe("Use a whole number of days");
  });
});
