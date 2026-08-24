import { describe, expect, it } from "bun:test";
import {
  findCurrentAvailabilityWindow,
  findNextAvailabilityWindow,
  isInAvailabilityWindow,
  wasNotifiedInCurrentAvailabilityWindow,
} from "../src/availability";
import type { AvailabilityWindow } from "../src/types";

const mondayEvening: AvailabilityWindow[] = [
  { dayOfWeek: 1, startTime: "18:00", endTime: "22:00" },
];

const mondayLateAfternoon: AvailabilityWindow[] = [
  { dayOfWeek: 1, startTime: "17:00", endTime: "19:00" },
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

describe("findCurrentAvailabilityWindow", () => {
  it("returns the window that contains now", () => {
    expect(
      findCurrentAvailabilityWindow(mondayLateAfternoon, new Date("2026-06-15T17:30:00")),
    ).toEqual({ dayOfWeek: 1, startTime: "17:00", endTime: "19:00" });
  });

  it("returns null outside a configured window", () => {
    expect(
      findCurrentAvailabilityWindow(mondayLateAfternoon, new Date("2026-06-15T16:59:00")),
    ).toBeNull();
  });
});

describe("wasNotifiedInCurrentAvailabilityWindow", () => {
  it("is true when the last send was earlier in the same 17-19 window", () => {
    expect(
      wasNotifiedInCurrentAvailabilityWindow(
        mondayLateAfternoon,
        new Date("2026-06-15T17:00:00"),
        new Date("2026-06-15T18:30:00"),
      ),
    ).toBe(true);
  });

  it("is false when the last send was a previous day's window", () => {
    expect(
      wasNotifiedInCurrentAvailabilityWindow(
        [
          { dayOfWeek: 0, startTime: "17:00", endTime: "19:00" },
          { dayOfWeek: 1, startTime: "17:00", endTime: "19:00" },
        ],
        new Date("2026-06-14T17:00:00"),
        new Date("2026-06-15T17:00:00"),
      ),
    ).toBe(false);
  });

  it("is false when the last send was a different window the same day", () => {
    expect(
      wasNotifiedInCurrentAvailabilityWindow(
        [
          { dayOfWeek: 1, startTime: "09:00", endTime: "11:00" },
          { dayOfWeek: 1, startTime: "17:00", endTime: "19:00" },
        ],
        new Date("2026-06-15T09:30:00"),
        new Date("2026-06-15T17:00:00"),
      ),
    ).toBe(false);
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
