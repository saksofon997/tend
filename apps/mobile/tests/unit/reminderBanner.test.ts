import { describe, expect, it } from "bun:test";
import type { ReminderResponse } from "../../src/types";
import {
  REMINDER_BANNER_MAX_ITEMS,
  reminderItemIdsKey,
  selectReminderBannerItems,
} from "../../src/utils/reminderBanner";

function reminder(overrides: Partial<ReminderResponse>): ReminderResponse {
  return {
    itemId: "item",
    name: "Item",
    type: "must",
    status: "needs_attention",
    daysSinceLastTended: 10,
    sharedWith: null,
    emphasis: "strong",
    visibility: "now",
    copy: "Item needs attention.",
    ...overrides,
  };
}

describe("selectReminderBannerItems", () => {
  it("keeps only must items that need attention", () => {
    const selected = selectReminderBannerItems([
      reminder({ itemId: "must-attention", name: "Medication" }),
      reminder({ itemId: "must-stale", name: "Pet food", status: "getting_stale" }),
      reminder({ itemId: "want-attention", name: "Bed sheets", type: "want" }),
    ]);

    expect(selected.map((entry) => entry.itemId)).toEqual(["must-attention"]);
  });

  it("returns the three most urgent must reminders", () => {
    const selected = selectReminderBannerItems([
      reminder({ itemId: "five", name: "Five", daysSinceLastTended: 5 }),
      reminder({ itemId: "never", name: "Never", daysSinceLastTended: null }),
      reminder({ itemId: "twelve", name: "Twelve", daysSinceLastTended: 12 }),
      reminder({ itemId: "eight", name: "Eight", daysSinceLastTended: 8 }),
    ]);

    expect(selected).toHaveLength(REMINDER_BANNER_MAX_ITEMS);
    expect(selected.map((entry) => entry.itemId)).toEqual(["never", "twelve", "eight"]);
  });
});

describe("reminderItemIdsKey", () => {
  it("is stable regardless of reminder order", () => {
    const first = reminderItemIdsKey([{ itemId: "b" }, { itemId: "a" }, { itemId: "c" }]);
    const second = reminderItemIdsKey([{ itemId: "c" }, { itemId: "b" }, { itemId: "a" }]);

    expect(first).toBe(second);
  });
});
