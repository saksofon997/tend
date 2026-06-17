import { describe, expect, it } from "bun:test";
import type { ActivityEntryResponse } from "@/lib/activity/serialize";
import { formatActivityWeekLabel, groupActivityEntriesByWeek } from "@/lib/activity/week-groups";

function event(overrides: Partial<ActivityEntryResponse> & Pick<ActivityEntryResponse, "id">) {
  return {
    itemId: "item-1",
    itemName: "Water plants",
    tendedAt: "2026-06-16T12:00:00.000Z",
    createdAt: "2026-06-16T12:00:00.000Z",
    ...overrides,
  };
}

describe("formatActivityWeekLabel", () => {
  const now = new Date("2026-06-17T12:00:00.000Z");

  it("labels the current calendar week", () => {
    expect(formatActivityWeekLabel(new Date("2026-06-14T12:00:00.000Z"), now)).toBe("This week");
  });

  it("labels the previous calendar week", () => {
    expect(formatActivityWeekLabel(new Date("2026-06-07T12:00:00.000Z"), now)).toBe("Last week");
  });

  it("formats older weeks by their starting date", () => {
    expect(formatActivityWeekLabel(new Date("2026-05-31T12:00:00.000Z"), now)).toBe(
      "Week of May 31, 2026",
    );
  });
});

describe("groupActivityEntriesByWeek", () => {
  const now = new Date("2026-06-17T12:00:00.000Z");

  it("groups entries into calendar weeks in newest-first order", () => {
    const groups = groupActivityEntriesByWeek(
      [
        event({ id: "old", tendedAt: "2026-05-31T12:00:00.000Z" }),
        event({ id: "current", tendedAt: "2026-06-16T12:00:00.000Z" }),
        event({ id: "previous", tendedAt: "2026-06-10T12:00:00.000Z" }),
      ],
      now,
    );

    expect(groups.map((group) => group.label)).toEqual([
      "This week",
      "Last week",
      "Week of May 31, 2026",
    ]);
    expect(groups.map((group) => group.entries.map((entry) => entry.id))).toEqual([
      ["current"],
      ["previous"],
      ["old"],
    ]);
  });

  it("keeps entries within each week sorted by tended date", () => {
    const groups = groupActivityEntriesByWeek(
      [
        event({ id: "monday", tendedAt: "2026-06-15T12:00:00.000Z" }),
        event({ id: "wednesday", tendedAt: "2026-06-17T12:00:00.000Z" }),
        event({ id: "sunday", tendedAt: "2026-06-14T12:00:00.000Z" }),
      ],
      now,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.entries.map((entry) => entry.id)).toEqual(["wednesday", "monday", "sunday"]);
  });
});
