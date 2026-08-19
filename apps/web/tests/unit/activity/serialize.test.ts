import { describe, expect, it } from "bun:test";
import { serializeActivityEntry } from "@/lib/activity/serialize";
import type { RecentEventWithItem } from "@tend/db";

describe("serializeActivityEntry", () => {
  it("includes the tend type so activity can be filtered and labeled", () => {
    const row = {
      event: {
        id: "event-1",
        itemId: "item-1",
        tendedAt: new Date("2026-08-19T12:00:00.000Z"),
        createdAt: new Date("2026-08-19T12:00:00.000Z"),
      },
      item: {
        id: "item-1",
        name: "Water plants",
        type: "want",
      },
    } as RecentEventWithItem;

    expect(serializeActivityEntry(row)).toEqual({
      id: "event-1",
      itemId: "item-1",
      itemName: "Water plants",
      itemType: "want",
      tendedAt: "2026-08-19T12:00:00.000Z",
      createdAt: "2026-08-19T12:00:00.000Z",
    });
  });
});
