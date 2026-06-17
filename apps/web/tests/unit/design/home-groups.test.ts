import { describe, expect, it } from "bun:test";
import {
  buildAttentionGroups,
  getAttentionSectionDefaults,
  hasItemsNeedingAttention,
  shouldShowAllFreshBanner,
} from "@/lib/design/home-groups";
import type { ItemResponse } from "@/lib/items/serialize";

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
  it("groups items into attention sections in priority order", () => {
    const groups = buildAttentionGroups([
      item({
        id: "needs-attention",
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

    expect(groups.needsAttention.map((entry) => entry.id)).toEqual(["needs-attention", "other"]);
  });

  it("keeps fresh items in the looking good section", () => {
    const groups = buildAttentionGroups([
      item({
        id: "1",
        name: "Plants",
        status: "fresh",
        daysSinceLastTended: 1,
        lastTendedAt: "2026-06-14T12:00:00.000Z",
      }),
    ]);

    expect(groups.lookingGood.map((entry) => entry.id)).toEqual(["1"]);
  });

  it("treats a lone needs-attention item as needing attention", () => {
    const groups = buildAttentionGroups([
      item({
        id: "needs-attention",
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

    expect(groups.needsAttention.map((entry) => entry.id)).toEqual(["needs-attention"]);
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

describe("getAttentionSectionDefaults", () => {
  it("expands only Needs attention when that section has items", () => {
    expect(getAttentionSectionDefaults(2, 1)).toEqual({
      needsAttention: true,
      gettingStale: false,
      lookingGood: false,
    });
  });

  it("expands Getting stale when Needs attention is empty and stale has items", () => {
    expect(getAttentionSectionDefaults(0, 1)).toEqual({
      needsAttention: false,
      gettingStale: true,
      lookingGood: false,
    });
  });

  it("keeps Getting stale collapsed when it is empty", () => {
    expect(getAttentionSectionDefaults(0, 0)).toEqual({
      needsAttention: false,
      gettingStale: false,
      lookingGood: false,
    });
  });
});
