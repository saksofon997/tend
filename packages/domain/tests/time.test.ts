import { describe, expect, it } from "bun:test";
import { calendarDaysBetween } from "../src/time";

describe("calendarDaysBetween", () => {
  it("counts whole calendar days between UTC date keys", () => {
    const earlier = new Date("2026-06-04T12:00:00.000Z");
    const later = new Date("2026-06-15T12:00:00.000Z");
    expect(calendarDaysBetween(earlier, later)).toBe(11);
  });

  it("returns zero for the same calendar day even when hours differ", () => {
    const earlier = new Date("2026-06-16T01:00:00.000Z");
    const later = new Date("2026-06-16T23:00:00.000Z");
    expect(calendarDaysBetween(earlier, later)).toBe(0);
  });

  it("returns one for adjacent calendar days", () => {
    const earlier = new Date("2026-06-15T23:00:00.000Z");
    const later = new Date("2026-06-16T01:00:00.000Z");
    expect(calendarDaysBetween(earlier, later)).toBe(1);
  });
});
