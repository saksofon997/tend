import { describe, expect, it } from "bun:test";
import { replaceActivityEvent } from "../../src/hooks/useActivityEvents";
import type { ActivityEntryResponse } from "../../src/types";

function event(overrides: Partial<ActivityEntryResponse>): ActivityEntryResponse {
  return {
    id: "event-1",
    itemId: "item-1",
    itemName: "Water plants",
    itemType: "want",
    tendedAt: "2026-06-10T12:00:00.000Z",
    createdAt: "2026-06-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("replaceActivityEvent", () => {
  it("replaces an edited activity event and keeps newest events first", () => {
    const updated = event({
      id: "event-1",
      tendedAt: "2026-06-22T12:00:00.000Z",
    });

    const events = replaceActivityEvent(
      [
        event({ id: "event-1", tendedAt: "2026-06-10T12:00:00.000Z" }),
        event({ id: "event-2", tendedAt: "2026-06-20T12:00:00.000Z" }),
      ],
      updated,
    );

    expect(events.map((activityEvent) => activityEvent.id)).toEqual(["event-1", "event-2"]);
    expect(events[0]).toEqual(updated);
  });
});
