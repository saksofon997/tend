import { describe, expect, it } from "bun:test";
import { findNextAvailabilityWindow, isInAvailabilityWindow } from "../src/availability";
import type { AvailabilityWindow } from "../src/types";

const mondayEvening: AvailabilityWindow[] = [
  { dayOfWeek: 1, startTime: "18:00", endTime: "22:00" },
];

// 2026-06-15 is a Monday
const monday = new Date("2026-06-15T19:00:00");

describe("isInAvailabilityWindow", () => {
  it("returns false when no windows are configured", () => {
    expect(isInAvailabilityWindow([], monday)).toBe(false);
  });

  it("returns true inside a configured window", () => {
    expect(isInAvailabilityWindow(mondayEvening, monday)).toBe(true);
  });

  it("returns false outside a configured window", () => {
    expect(isInAvailabilityWindow(mondayEvening, new Date("2026-06-15T12:00:00"))).toBe(false);
  });

  it("returns false at the window end boundary", () => {
    expect(isInAvailabilityWindow(mondayEvening, new Date("2026-06-15T22:00:00"))).toBe(false);
  });
});

describe("findNextAvailabilityWindow", () => {
  it("returns null when no windows are configured", () => {
    expect(findNextAvailabilityWindow([], new Date("2026-06-15T12:00:00"))).toBeNull();
  });

  it("returns later today when the window has not started yet", () => {
    const next = findNextAvailabilityWindow(mondayEvening, new Date("2026-06-15T12:00:00"));
    expect(next).toEqual(new Date("2026-06-15T18:00:00"));
  });

  it("returns next week when today's window has passed", () => {
    const next = findNextAvailabilityWindow(mondayEvening, new Date("2026-06-15T23:00:00"));
    expect(next).toEqual(new Date("2026-06-22T18:00:00"));
  });
});

describe("parseTimeToMinutes", () => {
  it("rejects invalid time strings", async () => {
    const { parseTimeToMinutes } = await import("../src/time");
    expect(() => parseTimeToMinutes("25:00")).toThrow("Invalid time format");
  });
});
