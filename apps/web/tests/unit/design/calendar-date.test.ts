import { describe, expect, it } from "bun:test";
import {
  calendarDateFromLocalDate,
  calendarDisabledMatchers,
  localDateFromCalendarDate,
  nextVisibleMonth,
  retainMonthIfUnchanged,
  visibleMonthFromLocalDate,
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

  it("does not replace the displayed month Date when the calendar day stays in the same month", () => {
    const current = new Date(2026, 7, 1);
    const next = retainMonthIfUnchanged(current, localDateFromCalendarDate("2026-08-26"));
    expect(next).toBe(current);
  });

  it("replaces the displayed month Date when the year or month changes", () => {
    const current = new Date(2026, 7, 1);
    const next = retainMonthIfUnchanged(current, localDateFromCalendarDate("2026-07-15"));
    expect(next).not.toBe(current);
    expect(visibleMonthFromLocalDate(next)).toEqual({ year: 2026, month: 7 });
  });

  it("does not emit a new visible month when DayPicker reports the same year and month", () => {
    const nextDate = new Date(2026, 7, 26);
    expect(nextVisibleMonth({ year: 2026, month: 8 }, nextDate)).toBeNull();
  });

  it("emits a new visible month when DayPicker navigates to another month", () => {
    expect(nextVisibleMonth({ year: 2026, month: 8 }, new Date(2026, 8, 1))).toEqual({
      year: 2026,
      month: 9,
    });
  });
});
