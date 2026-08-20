import { describe, expect, it } from "bun:test";
import { buildCheckInSummary, eventsInCheckInPeriod } from "../src/check-in";
import type { CheckInEventInput, CheckInItemInput } from "../src/check-in";

const items: CheckInItemInput[] = [
  {
    id: "plants",
    name: "Water plants",
    type: "want",
    status: "fresh",
    lifeArea: "household",
  },
  {
    id: "dinner",
    name: "Dinner with Maya",
    type: "want",
    status: "getting_stale",
    lifeArea: "relationships",
    sharedWith: { id: "maya", displayName: "Maya" },
  },
  {
    id: "meds",
    name: "Refill medication",
    type: "must",
    status: "needs_attention",
    lifeArea: "health",
  },
];

const events: CheckInEventInput[] = [
  {
    id: "event-1",
    itemId: "plants",
    itemName: "Water plants",
    tendedAt: "2026-07-06T09:00:00.000Z",
  },
  {
    id: "event-2",
    itemId: "dinner",
    itemName: "Dinner with Maya",
    tendedAt: "2026-07-06T18:00:00.000Z",
  },
  {
    id: "event-3",
    itemId: "dinner",
    itemName: "Dinner with Maya",
    tendedAt: "2026-07-07T18:00:00.000Z",
  },
  {
    id: "event-4",
    itemId: "archived",
    itemName: "Archived tend",
    tendedAt: "2026-07-07T18:00:00.000Z",
  },
];

describe("buildCheckInSummary", () => {
  it("summarizes tending patterns without requiring a separate tracking model", () => {
    const summary = buildCheckInSummary(items, events);

    expect(summary.totalTends).toBe(4);
    expect(summary.tendedItemCount).toBe(3);
    expect(summary.careDays).toBe(2);
    expect(summary.activeItemCount).toBe(3);
    expect(summary.sharedItemCount).toBe(1);
    expect(summary.mostTendedItem).toEqual({
      itemId: "dinner",
      name: "Dinner with Maya",
      count: 2,
    });
    expect(summary.mostTendedWith).toEqual({ displayName: "Maya", count: 2 });
    expect(summary.mostTendedLifeArea).toEqual({ lifeArea: "relationships", count: 2 });
    expect(summary.mostActiveWeekday).toEqual({ weekday: 1, count: 2 });
    expect(summary.attentionCounts).toEqual({
      fresh: 1,
      gettingStale: 1,
      needsAttention: 1,
    });
  });

  it("returns empty stats when there is no tending history yet", () => {
    const summary = buildCheckInSummary(items, []);

    expect(summary.totalTends).toBe(0);
    expect(summary.tendedItemCount).toBe(0);
    expect(summary.careDays).toBe(0);
    expect(summary.mostTendedItem).toBeNull();
    expect(summary.mostTendedWith).toBeNull();
    expect(summary.mostTendedLifeArea).toBeNull();
    expect(summary.mostActiveWeekday).toBeNull();
    expect(summary.weekdayCounts.every((entry) => entry.count === 0)).toBe(true);
  });

  it("keeps only events inside the selected check-in period", () => {
    const now = new Date("2026-07-14T12:00:00.000Z");
    const filtered = eventsInCheckInPeriod(events, "week", now);

    expect(filtered.map((event) => event.id)).toEqual(["event-3", "event-4"]);
    expect(buildCheckInSummary(items, filtered).totalTends).toBe(2);
  });

  it("leaves all events in place for the all-time period", () => {
    const now = new Date("2026-07-14T12:00:00.000Z");
    expect(eventsInCheckInPeriod(events, "all", now)).toEqual(events);
  });
});
