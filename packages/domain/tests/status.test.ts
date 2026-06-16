import { describe, expect, it } from "bun:test";
import { computeStatus, daysSinceLastTended } from "../src/status";

const now = new Date("2026-06-15T12:00:00");

function daysAgo(days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

describe("computeStatus", () => {
  it("returns needs_attention when last tended is null", () => {
    expect(
      computeStatus({
        lastTendedAt: null,
        rhythmDays: 7,
        now,
      }),
    ).toBe("needs_attention");
  });

  it("returns needs_attention when rhythm is invalid", () => {
    expect(
      computeStatus({
        lastTendedAt: daysAgo(1),
        rhythmDays: 0,
        now,
      }),
    ).toBe("needs_attention");
  });

  it("returns fresh when tended within half the rhythm", () => {
    expect(
      computeStatus({
        lastTendedAt: daysAgo(3),
        rhythmDays: 7,
        now,
      }),
    ).toBe("fresh");
  });

  it("returns fresh at exactly half the rhythm", () => {
    expect(
      computeStatus({
        lastTendedAt: daysAgo(3),
        rhythmDays: 6,
        now,
      }),
    ).toBe("fresh");
  });

  it("returns getting_stale after half the rhythm", () => {
    expect(
      computeStatus({
        lastTendedAt: daysAgo(4),
        rhythmDays: 7,
        now,
      }),
    ).toBe("getting_stale");
  });

  it("returns getting_stale at exactly one rhythm period", () => {
    expect(
      computeStatus({
        lastTendedAt: daysAgo(7),
        rhythmDays: 7,
        now,
      }),
    ).toBe("getting_stale");
  });

  it("returns needs_attention after the rhythm period", () => {
    expect(
      computeStatus({
        lastTendedAt: daysAgo(11),
        rhythmDays: 7,
        now,
      }),
    ).toBe("needs_attention");
  });

  it("returns fresh when last tended is in the future", () => {
    expect(
      computeStatus({
        lastTendedAt: new Date("2026-06-20T12:00:00"),
        rhythmDays: 7,
        now,
      }),
    ).toBe("fresh");
  });
});

describe("daysSinceLastTended", () => {
  it("returns null when never tended", () => {
    expect(daysSinceLastTended(null, now)).toBeNull();
  });

  it("returns whole calendar days since last tended", () => {
    expect(daysSinceLastTended(daysAgo(11), now)).toBe(11);
  });

  it("uses calendar days instead of elapsed hours", () => {
    const lastTendedAt = new Date("2026-06-15T23:00:00.000Z");
    const earlyMorning = new Date("2026-06-16T01:00:00.000Z");
    expect(daysSinceLastTended(lastTendedAt, earlyMorning)).toBe(1);
  });
});
