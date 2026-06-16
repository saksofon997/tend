import { describe, expect, it } from "bun:test";
import { availabilityWindowsEqual, normalizeTimeInput } from "@/lib/availability/compare-windows";

describe("normalizeTimeInput", () => {
  it("strips seconds from time values", () => {
    expect(normalizeTimeInput("17:00:00")).toBe("17:00");
  });
});

describe("availabilityWindowsEqual", () => {
  it("returns true for identical windows", () => {
    const windows = [{ dayOfWeek: 6, startTime: "17:00", endTime: "20:00" }];

    expect(availabilityWindowsEqual(windows, windows)).toBe(true);
  });

  it("returns true when order differs but content matches", () => {
    const a = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
      { dayOfWeek: 6, startTime: "17:00", endTime: "20:00" },
    ];
    const b = [
      { dayOfWeek: 6, startTime: "17:00", endTime: "20:00" },
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
    ];

    expect(availabilityWindowsEqual(a, b)).toBe(true);
  });

  it("returns false when a window is added or removed", () => {
    const saved = [{ dayOfWeek: 6, startTime: "17:00", endTime: "20:00" }];
    const edited = [
      { dayOfWeek: 6, startTime: "17:00", endTime: "20:00" },
      { dayOfWeek: 1, startTime: "18:00", endTime: "20:00" },
    ];

    expect(availabilityWindowsEqual(saved, edited)).toBe(false);
  });

  it("returns false when times change", () => {
    const saved = [{ dayOfWeek: 6, startTime: "17:00", endTime: "20:00" }];
    const edited = [{ dayOfWeek: 6, startTime: "18:00", endTime: "20:00" }];

    expect(availabilityWindowsEqual(saved, edited)).toBe(false);
  });

  it("treats equivalent time formats as equal", () => {
    const saved = [{ dayOfWeek: 6, startTime: "17:00", endTime: "20:00" }];
    const edited = [{ dayOfWeek: 6, startTime: "17:00:00", endTime: "20:00:00" }];

    expect(availabilityWindowsEqual(saved, edited)).toBe(true);
  });
});
