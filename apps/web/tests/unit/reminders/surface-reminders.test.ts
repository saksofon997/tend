import { describe, expect, it } from "bun:test";
import {
  REMINDER_BANNER_MAX_ITEMS,
  pickReminderBannerItems,
  reminderItemIdsKey,
} from "@/lib/reminders/surface-reminders";

describe("pickReminderBannerItems", () => {
  it("returns every reminder when there are three or fewer", () => {
    const reminders = [
      { itemId: "a", name: "A" },
      { itemId: "b", name: "B" },
    ];

    expect(pickReminderBannerItems(reminders)).toEqual(reminders);
  });

  it("returns exactly three reminders when more are eligible", () => {
    const reminders = Array.from({ length: 5 }, (_, index) => ({
      itemId: `item-${index}`,
      name: `Item ${index}`,
    }));

    const picked = pickReminderBannerItems(reminders);

    expect(picked).toHaveLength(REMINDER_BANNER_MAX_ITEMS);
    expect(new Set(picked.map((reminder) => reminder.itemId)).size).toBe(REMINDER_BANNER_MAX_ITEMS);
    expect(picked.every((reminder) => reminders.includes(reminder))).toBe(true);
  });

  it("does not mutate the source list", () => {
    const reminders = [
      { itemId: "a", name: "A" },
      { itemId: "b", name: "B" },
      { itemId: "c", name: "C" },
      { itemId: "d", name: "D" },
    ];
    const snapshot = reminders.map((reminder) => ({ ...reminder }));

    pickReminderBannerItems(reminders);

    expect(reminders).toEqual(snapshot);
  });

  it("can pick different subsets across calls", () => {
    const reminders = Array.from({ length: 6 }, (_, index) => ({
      itemId: `item-${index}`,
      name: `Item ${index}`,
    }));

    const seen = new Set<string>();

    for (let attempt = 0; attempt < 20; attempt++) {
      const picked = pickReminderBannerItems(reminders);
      seen.add(
        picked
          .map((reminder) => reminder.itemId)
          .sort()
          .join(","),
      );
    }

    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("reminderItemIdsKey", () => {
  it("is stable regardless of reminder order", () => {
    const first = reminderItemIdsKey([{ itemId: "b" }, { itemId: "a" }, { itemId: "c" }]);
    const second = reminderItemIdsKey([{ itemId: "c" }, { itemId: "b" }, { itemId: "a" }]);

    expect(first).toBe(second);
  });
});
