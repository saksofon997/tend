import { describe, expect, it } from "bun:test";
import {
  REMINDER_BANNER_MAX_ITEMS,
  reminderItemIdsKey,
  selectReminderBannerItems,
} from "@/lib/reminders/surface-reminders";

describe("selectReminderBannerItems", () => {
  it("keeps only must items that need attention", () => {
    const reminders = [
      reminder({ itemId: "must-attention", name: "Medication" }),
      reminder({ itemId: "must-stale", name: "Pet food", status: "getting_stale" }),
      reminder({ itemId: "want-attention", name: "Bed sheets", type: "want" }),
    ];

    expect(selectReminderBannerItems(reminders).map((entry) => entry.itemId)).toEqual([
      "must-attention",
    ]);
  });

  it("returns the three most urgent must reminders", () => {
    const reminders = [
      reminder({ itemId: "five", name: "Five", daysSinceLastTended: 5 }),
      reminder({ itemId: "never", name: "Never", daysSinceLastTended: null }),
      reminder({ itemId: "twelve", name: "Twelve", daysSinceLastTended: 12 }),
      reminder({ itemId: "eight", name: "Eight", daysSinceLastTended: 8 }),
    ];

    const selected = selectReminderBannerItems(reminders);

    expect(selected).toHaveLength(REMINDER_BANNER_MAX_ITEMS);
    expect(selected.map((entry) => entry.itemId)).toEqual(["never", "twelve", "eight"]);
  });

  it("does not mutate the source list", () => {
    const reminders = [
      reminder({ itemId: "a", name: "A", daysSinceLastTended: 1 }),
      reminder({ itemId: "b", name: "B", daysSinceLastTended: 3 }),
      reminder({ itemId: "c", name: "C", daysSinceLastTended: 2 }),
    ];
    const snapshot = reminders.map((entry) => ({ ...entry }));

    selectReminderBannerItems(reminders);

    expect(reminders).toEqual(snapshot);
  });
});

describe("reminderItemIdsKey", () => {
  it("is stable regardless of reminder order", () => {
    const first = reminderItemIdsKey([{ itemId: "b" }, { itemId: "a" }, { itemId: "c" }]);
    const second = reminderItemIdsKey([{ itemId: "c" }, { itemId: "b" }, { itemId: "a" }]);

    expect(first).toBe(second);
  });
});

function reminder(
  overrides: Partial<{
    itemId: string;
    name: string;
    type: "must" | "want";
    status: "getting_stale" | "needs_attention";
    daysSinceLastTended: number | null;
  }>,
) {
  return {
    itemId: "item",
    name: "Item",
    type: "must" as const,
    status: "needs_attention" as const,
    daysSinceLastTended: 10,
    ...overrides,
  };
}
