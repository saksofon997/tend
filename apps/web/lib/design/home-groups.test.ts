import { describe, expect, it } from "bun:test";
import type { ItemResponse } from "@/lib/items/serialize";
import { buildAttentionGroups } from "./home-groups";

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
});
