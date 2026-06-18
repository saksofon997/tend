import { describe, expect, it } from "bun:test";
import {
  calendarDaysBetween,
  isValidTimeZone,
  localDateInTimeZone,
  zonedLocalDateToInstant,
} from "../src/time";

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

describe("timezone helpers", () => {
  it("validates IANA timezone names", () => {
    expect(isValidTimeZone("Europe/Belgrade")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
  });

  it("converts an instant to local wall time in a timezone", () => {
    const localDate = localDateInTimeZone(new Date("2026-06-17T10:30:00.000Z"), "Europe/Belgrade");

    expect(localDate.getFullYear()).toBe(2026);
    expect(localDate.getMonth()).toBe(5);
    expect(localDate.getDate()).toBe(17);
    expect(localDate.getHours()).toBe(12);
    expect(localDate.getMinutes()).toBe(30);
  });

  it("converts local wall time in a timezone back to an instant", () => {
    const instant = zonedLocalDateToInstant(new Date(2026, 5, 17, 12, 30, 0), "Europe/Belgrade");

    expect(instant.toISOString()).toBe("2026-06-17T10:30:00.000Z");
  });
});
