import { describe, expect, it } from "bun:test";
import {
  isWeeklySupportDue,
  weeklySupportCopy,
  weeklySupportLookbackStart,
  weeklySupportTone,
} from "../src/weekly-support";

describe("weekly support", () => {
  it("uses qualitative tones instead of a score", () => {
    expect(weeklySupportTone(0)).toBe("quiet");
    expect(weeklySupportTone(1)).toBe("present");
    expect(weeklySupportTone(3)).toBe("present");
    expect(weeklySupportTone(4)).toBe("steady");
  });

  it("keeps empty-week copy motivational rather than guilty", () => {
    const copy = weeklySupportCopy(0);
    expect(copy.title).toContain("small week");
    expect(copy.body.toLowerCase()).not.toContain("missed");
    expect(copy.body.toLowerCase()).not.toContain("forgot");
    expect(copy.body.toLowerCase()).not.toContain("overdue");
  });

  it("looks back seven days when counting tends", () => {
    const now = new Date("2026-08-17T15:00:00.000Z");
    expect(weeklySupportLookbackStart(now).toISOString()).toBe("2026-08-10T15:00:00.000Z");
  });

  it("waits for a daytime window and a week since the last note", () => {
    const now = new Date("2026-08-17T15:00:00.000Z");
    const firstEligibleAt = new Date("2026-08-01T12:00:00.000Z");

    expect(
      isWeeklySupportDue(now, "UTC", new Date("2026-08-16T12:00:00.000Z"), firstEligibleAt),
    ).toBe(false);
    expect(
      isWeeklySupportDue(now, "UTC", new Date("2026-08-10T12:00:00.000Z"), firstEligibleAt),
    ).toBe(true);
    expect(
      isWeeklySupportDue(new Date("2026-08-17T02:00:00.000Z"), "UTC", null, firstEligibleAt),
    ).toBe(false);
    expect(isWeeklySupportDue(now, "UTC", null, firstEligibleAt)).toBe(true);
  });
});
