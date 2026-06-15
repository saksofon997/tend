import { describe, expect, it } from "bun:test";
import { isOnboardingComplete } from "./settings";

describe("isOnboardingComplete", () => {
  it("returns false when onboarding has not been completed", () => {
    expect(isOnboardingComplete(null)).toBe(false);
    expect(
      isOnboardingComplete({
        userId: "user-1",
        onboardingCompletedAt: null,
        timezone: "UTC",
      }),
    ).toBe(false);
  });

  it("returns true when onboarding completed timestamp exists", () => {
    expect(
      isOnboardingComplete({
        userId: "user-1",
        onboardingCompletedAt: new Date("2026-06-15T12:00:00"),
        timezone: "UTC",
      }),
    ).toBe(true);
  });
});
