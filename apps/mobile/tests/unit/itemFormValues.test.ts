import { describe, expect, it } from "bun:test";
import type { ItemResponse } from "../../src/types";
import { itemFormValuesFromItem } from "../../src/utils/itemFormValues";

const baseItem: ItemResponse = {
  id: "item-1",
  name: "Water plants",
  type: "want",
  rhythmDays: 7,
  lifeArea: "home",
  sharedWith: null,
  lastTendedAt: "2026-06-10T12:00:00.000Z",
  status: "fresh",
  daysSinceLastTended: 8,
  archivedAt: null,
  createdAt: "2026-06-01T12:00:00.000Z",
  updatedAt: "2026-06-10T12:00:00.000Z",
};

describe("itemFormValuesFromItem", () => {
  it("maps item fields into edit form values", () => {
    expect(itemFormValuesFromItem(baseItem)).toEqual({
      name: "Water plants",
      type: "want",
      rhythmDays: 7,
      lifeArea: "home",
      lastTendedDate: "2026-06-10",
      sharedWithEmail: "",
    });
  });

  it("maps shared user email into edit form values", () => {
    const item = {
      ...baseItem,
      sharedWith: { id: "user-2", displayName: "Mira", email: "mira@example.com" },
    };

    expect(itemFormValuesFromItem(item).sharedWithEmail).toBe("mira@example.com");
  });

  it("uses today when lastTendedAt is missing", () => {
    const item = { ...baseItem, lastTendedAt: null };

    expect(itemFormValuesFromItem(item).lastTendedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
