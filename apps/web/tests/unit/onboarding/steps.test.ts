import { describe, expect, it } from "bun:test";
import { ONBOARDING_STEP_NUMBERS, ONBOARDING_TOTAL_STEPS } from "@/lib/onboarding/steps";

describe("onboarding steps", () => {
  it("uses four steps with browse suggestions on step 3 and item form on step 4", () => {
    expect(ONBOARDING_TOTAL_STEPS).toBe(4);
    expect(ONBOARDING_STEP_NUMBERS.welcome).toBe(1);
    expect(ONBOARDING_STEP_NUMBERS.choose).toBe(2);
    expect(ONBOARDING_STEP_NUMBERS.preset).toBe(3);
    expect(ONBOARDING_STEP_NUMBERS.itemForm).toBe(4);
  });

  it("places custom and preset item forms on the same final step", () => {
    expect(ONBOARDING_STEP_NUMBERS.itemForm).toBe(ONBOARDING_TOTAL_STEPS);
    expect(ONBOARDING_STEP_NUMBERS.preset).toBeLessThan(ONBOARDING_STEP_NUMBERS.itemForm);
  });
});
