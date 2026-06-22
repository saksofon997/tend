import { describe, expect, it } from "bun:test";
import {
  MARK_TENDED_CONFIRMATION_MS,
  markTendedButtonLabel,
} from "@/components/tend/mark-tended-button";

describe("markTendedButtonLabel", () => {
  it("uses the default action label before tending", () => {
    expect(markTendedButtonLabel({ loading: false, confirmed: false })).toBe("Mark tended");
  });

  it("uses the loading label while tending", () => {
    expect(markTendedButtonLabel({ loading: true, confirmed: false })).toBe("Updating…");
  });

  it("uses a short confirmation label after tending", () => {
    expect(markTendedButtonLabel({ loading: false, confirmed: true })).toBe("Tended");
    expect(MARK_TENDED_CONFIRMATION_MS).toBeLessThan(1000);
  });

  it("uses translated labels when provided", () => {
    expect(
      markTendedButtonLabel({
        loading: false,
        confirmed: false,
        idleLabel: "Tendovano",
        loadingLabel: "Čuvanje…",
        confirmedLabel: "Tendovano",
      }),
    ).toBe("Tendovano");
  });
});
