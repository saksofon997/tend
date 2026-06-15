import { describe, expect, it } from "bun:test";
import type { ItemResponse } from "@/lib/items/serialize";
import {
  buildAttentionGroups,
  hasItemsNeedingAttention,
  shouldShowAllFreshBanner,
} from "./home-groups";

function item(overrides: Partial<ItemResponse> & Pick<ItemResponse, "id" | "name">): ItemResponse {
  return {
    type: "want",
    rhythmDays: 7,
    lifeArea: null,
    lastTendedAt: "2026-06-10T12:00:00.000Z",
    status: "getting_stale",
    daysSinceLastTended: 5,
    archivedAt: null,
    createdAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-06-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("buildAttentionGroups", () => {
  it("excludes the hero item from section lists", () => {
    const groups = buildAttentionGroups([
      item({
        id: "hero",
        name: "Bed sheets",
        type: "must",
        status: "needs_attention",
        daysSinceLastTended: 14,
        lastTendedAt: "2026-06-01T12:00:00.000Z",
      }),
      item({
        id: "other",
        name: "Vacuum",
        type: "must",
        status: "needs_attention",
        daysSinceLastTended: 13,
        lastTendedAt: "2026-06-02T12:00:00.000Z",
      }),
    ]);

    expect(groups.hero?.id).toBe("hero");
    expect(groups.needsAttention.map((entry) => entry.id)).toEqual(["other"]);
  });

  it("keeps section lists unchanged when there is no hero", () => {
    const groups = buildAttentionGroups([
      item({
        id: "1",
        name: "Plants",
        status: "fresh",
        daysSinceLastTended: 1,
        lastTendedAt: "2026-06-14T12:00:00.000Z",
      }),
    ]);

    expect(groups.hero).toBeUndefined();
    expect(groups.lookingGood.map((entry) => entry.id)).toEqual(["1"]);
  });

  it("treats the hero item as needing attention even when section lists are empty", () => {
    const groups = buildAttentionGroups([
      item({
        id: "hero",
        name: "Clean bathroom",
        status: "needs_attention",
        daysSinceLastTended: 8,
        lastTendedAt: "2026-06-07T12:00:00.000Z",
      }),
      item({
        id: "fresh",
        name: "Vacuum",
        status: "fresh",
        daysSinceLastTended: 1,
        lastTendedAt: "2026-06-14T12:00:00.000Z",
      }),
    ]);

    expect(groups.hero?.id).toBe("hero");
    expect(groups.needsAttention).toHaveLength(0);
    expect(hasItemsNeedingAttention(groups)).toBe(true);
    expect(shouldShowAllFreshBanner(groups)).toBe(false);
  });

  it("shows the all-fresh banner only when every item is fresh", () => {
    const groups = buildAttentionGroups([
      item({
        id: "1",
        name: "Plants",
        status: "fresh",
        daysSinceLastTended: 1,
        lastTendedAt: "2026-06-14T12:00:00.000Z",
      }),
    ]);

    expect(hasItemsNeedingAttention(groups)).toBe(false);
    expect(shouldShowAllFreshBanner(groups)).toBe(true);
  });
});
