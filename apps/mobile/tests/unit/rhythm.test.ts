import { describe, expect, it } from "bun:test";
import { RHYTHM_OPTIONS, isPresetRhythm } from "../../src/constants";
import { t } from "../../src/i18n";
import { rhythmDaysFieldError } from "../../src/utils/rhythm";

describe("rhythm helpers", () => {
  it("detects preset rhythm values", () => {
    expect(isPresetRhythm(7, RHYTHM_OPTIONS)).toBe(true);
    expect(isPresetRhythm(9, RHYTHM_OPTIONS)).toBe(false);
  });

  it("validates rhythm day bounds", () => {
    expect(rhythmDaysFieldError(1)).toBeNull();
    expect(rhythmDaysFieldError(365)).toBeNull();
    expect(rhythmDaysFieldError(0)).toBe(t("errors.item.rhythmMin"));
    expect(rhythmDaysFieldError(366)).toBe(t("errors.item.rhythmMax"));
    expect(rhythmDaysFieldError(7.5)).toBe(t("errors.item.rhythmInteger"));
  });
});
