import { describe, expect, it } from "bun:test";
import {
  dateInputToIso,
  isoToDateInputValue,
  toLocalDateString,
  todayDateInputValue,
} from "@/lib/onboarding/constants";

describe("toLocalDateString", () => {
  it("formats using local calendar date parts", () => {
    const date = new Date(2026, 5, 16, 1, 0, 0);
    expect(toLocalDateString(date)).toBe("2026-06-16");
  });
});

describe("todayDateInputValue", () => {
  it("uses local calendar date instead of UTC", () => {
    const earlyMorningLocal = new Date(2026, 5, 16, 1, 0, 0);
    expect(todayDateInputValue(earlyMorningLocal)).toBe("2026-06-16");
  });
});

describe("dateInputToIso", () => {
  it("stores calendar dates at UTC noon", () => {
    expect(dateInputToIso("2026-06-16")).toBe("2026-06-16T12:00:00.000Z");
  });
});

describe("isoToDateInputValue", () => {
  it("round-trips calendar dates stored at UTC noon", () => {
    expect(isoToDateInputValue("2026-06-16T12:00:00.000Z")).toBe("2026-06-16");
  });

  it("uses local calendar date for timestamps not at UTC noon", () => {
    const iso = "2026-06-16T09:00:00.000Z";
    const localDate = toLocalDateString(new Date(iso));
    expect(isoToDateInputValue(iso)).toBe(localDate);
  });

  it("does not shift a stored calendar date backward on edit", () => {
    const stored = dateInputToIso("2026-06-16");
    expect(isoToDateInputValue(stored)).toBe("2026-06-16");
  });
});
