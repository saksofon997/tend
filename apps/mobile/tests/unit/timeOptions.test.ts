import { describe, expect, it } from "bun:test";
import {
  TIME_OPTIONS,
  buildTimeOptions,
  normalizeTimeValue,
  timeOptionsAfter,
  timeOptionsIncluding,
} from "../../src/utils/timeOptions";

describe("timeOptions", () => {
  it("builds 30-minute slots for a full day", () => {
    expect(buildTimeOptions()).toEqual([
      "00:00",
      "00:30",
      "01:00",
      "01:30",
      "02:00",
      "02:30",
      "03:00",
      "03:30",
      "04:00",
      "04:30",
      "05:00",
      "05:30",
      "06:00",
      "06:30",
      "07:00",
      "07:30",
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
      "21:30",
      "22:00",
      "22:30",
      "23:00",
      "23:30",
    ]);
    expect(TIME_OPTIONS).toHaveLength(48);
  });

  it("normalizes invalid values to the fallback", () => {
    expect(normalizeTimeValue("18:00")).toBe("18:00");
    expect(normalizeTimeValue(" 09:15 ")).toBe("09:15");
    expect(normalizeTimeValue("invalid")).toBe("18:00");
    expect(normalizeTimeValue("25:00")).toBe("18:00");
  });

  it("includes off-grid saved values in the option list", () => {
    expect(timeOptionsIncluding("18:15")).toContain("18:15");
    expect(timeOptionsIncluding("18:00")).toEqual(TIME_OPTIONS);
  });

  it("filters end-time options to after the start time", () => {
    expect(timeOptionsAfter("18:00")).toEqual([
      "18:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
      "21:30",
      "22:00",
      "22:30",
      "23:00",
      "23:30",
    ]);
    expect(timeOptionsAfter("23:30")).toEqual([]);
  });
});
