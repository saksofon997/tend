import { describe, expect, it } from "bun:test";
import {
  REFLECTION_BODY_MAX_LENGTH,
  calendarDateString,
  calendarDatesInclusive,
  formatCalendarDate,
  isReflectionBodyWithinLimit,
  monthGridDates,
  normalizeReflectionBody,
  notebookDates,
  previewReflectionBody,
  shiftCalendarDate,
  shiftYearMonth,
} from "../src";

describe("calendar date helpers", () => {
  it("formats and shifts YYYY-MM-DD days across month boundaries", () => {
    expect(formatCalendarDate(2026, 1, 5)).toBe("2026-01-05");
    expect(shiftCalendarDate("2026-01-31", 1)).toBe("2026-02-01");
    expect(shiftCalendarDate("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("lists inclusive calendar dates", () => {
    expect(calendarDatesInclusive("2026-08-24", "2026-08-26")).toEqual([
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
    ]);
    expect(calendarDatesInclusive("2026-08-26", "2026-08-24")).toEqual([]);
  });

  it("reads the local calendar day of an instant in a timezone", () => {
    expect(calendarDateString(new Date("2026-08-26T02:30:00.000Z"), "America/Los_Angeles")).toBe(
      "2026-08-25",
    );
    expect(calendarDateString(new Date("2026-08-26T02:30:00.000Z"), "Europe/Belgrade")).toBe(
      "2026-08-26",
    );
  });

  it("shifts year and month", () => {
    expect(shiftYearMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftYearMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });
});

describe("reflection helpers", () => {
  it("counts normalized body length against the 1000 character leaf limit", () => {
    expect(isReflectionBodyWithinLimit("hello")).toBe(true);
    expect(isReflectionBodyWithinLimit(`${"a".repeat(REFLECTION_BODY_MAX_LENGTH)}\r\n`)).toBe(
      false,
    );
    expect(normalizeReflectionBody("one\r\ntwo")).toBe("one\ntwo");
  });

  it("builds a Sunday-first month grid with empty pads", () => {
    const cells = monthGridDates(2026, 8);
    expect(cells[0]).toBeNull();
    expect(cells[6]).toBe("2026-08-01");
    expect(cells[36]).toBe("2026-08-31");
    expect(cells.filter((cell) => cell !== null)).toHaveLength(31);
    expect(cells.length % 7).toBe(0);
  });

  it("keeps recent days, written leaves, and a jumped-to date in notebook order", () => {
    expect(
      notebookDates({
        today: "2026-08-26",
        entryDates: ["2026-07-04", "2026-08-20"],
        selectedDate: "2026-06-01",
        lookbackDays: 2,
      }),
    ).toEqual(["2026-06-01", "2026-07-04", "2026-08-20", "2026-08-24", "2026-08-25", "2026-08-26"]);
  });

  it("previews a leaf without guilt-shaped copy", () => {
    expect(previewReflectionBody("  quiet morning  ")).toBe("quiet morning");
    expect(previewReflectionBody("abcdefghij", 6)).toBe("abcdef…");
  });
});
