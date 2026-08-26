import { describe, expect, it } from "bun:test";
import {
  calendarDateFromLocalDate,
  calendarDisabledMatchers,
  localDateFromCalendarDate,
} from "@/lib/design/calendar-date";

describe("calendar date helpers", () => {
  it("round-trips a local calendar day without shifting timezone", () => {
    const date = localDateFromCalendarDate("2026-08-26");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(26);
    expect(calendarDateFromLocalDate(date)).toBe("2026-08-26");
  });

  it("rejects impossible calendar days", () => {
    expect(() => localDateFromCalendarDate("2026-02-31")).toThrow();
  });

  it("builds min and max matchers for DayPicker", () => {
    const matchers = calendarDisabledMatchers("2026-08-01", "2026-08-26");
    expect(matchers[0]).toEqual({ before: localDateFromCalendarDate("2026-08-01") });
    expect(matchers[1]).toEqual({ after: localDateFromCalendarDate("2026-08-26") });
  });

  it("omits matchers when bounds are absent", () => {
    expect(calendarDisabledMatchers()).toEqual([]);
  });
});
