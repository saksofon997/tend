import { describe, expect, it } from "bun:test";
import {
  formatRelativeFromDays,
  formatRelativeTended,
  formatRhythm,
} from "@/lib/design/relative-time";

describe("formatRelativeFromDays", () => {
  it("returns never tended when days are null", () => {
    expect(formatRelativeFromDays(null)).toBe("Never tended");
  });

  it("returns today for zero days", () => {
    expect(formatRelativeFromDays(0)).toBe("Last tended today");
  });

  it("returns yesterday for one day", () => {
    expect(formatRelativeFromDays(1)).toBe("Last tended yesterday");
  });

  it("returns day count for older values", () => {
    expect(formatRelativeFromDays(11)).toBe("Last tended 11 days ago");
  });
});

describe("formatRelativeTended", () => {
  const now = new Date("2026-06-15T12:00:00");

  it("returns never tended when date is null", () => {
    expect(formatRelativeTended(null, now)).toBe("Never tended");
  });

  it("returns today when tended same calendar day", () => {
    expect(formatRelativeTended(new Date("2026-06-15T08:00:00"), now)).toBe("Last tended today");
  });

  it("returns today when tended same calendar day at an early hour", () => {
    expect(formatRelativeTended(new Date(2026, 5, 15, 1, 0, 0), now)).toBe("Last tended today");
  });

  it("returns yesterday for one day ago", () => {
    expect(formatRelativeTended(new Date("2026-06-14T12:00:00"), now)).toBe(
      "Last tended yesterday",
    );
  });

  it("returns day count for older dates", () => {
    expect(formatRelativeTended(new Date("2026-06-04T12:00:00"), now)).toBe(
      "Last tended 11 days ago",
    );
  });
});

describe("formatRhythm", () => {
  it("formats common rhythms", () => {
    expect(formatRhythm(1)).toBe("Every day");
    expect(formatRhythm(7)).toBe("Every 7 days");
    expect(formatRhythm(14)).toBe("Every 2 weeks");
    expect(formatRhythm(30)).toBe("Every month");
  });

  it("formats custom day counts", () => {
    expect(formatRhythm(3)).toBe("Every 3 days");
  });
});
