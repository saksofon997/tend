import { describe, expect, it } from "bun:test";
import { groupForAttention, sortForAttention } from "../src/attention";
import type { TendItemInput } from "../src/types";

const now = new Date("2026-06-15T12:00:00");

function item(
  overrides: Partial<TendItemInput> & Pick<TendItemInput, "id" | "name">,
): TendItemInput {
  return {
    type: "want",
    rhythmDays: 7,
    lastTendedAt: new Date("2026-06-10T12:00:00"),
    ...overrides,
  };
}

describe("sortForAttention", () => {
  it("ranks needs_attention musts above needs_attention wants", () => {
    const sorted = sortForAttention(
      [
        item({
          id: "1",
          name: "Want item",
          type: "want",
          lastTendedAt: new Date("2026-05-01T12:00:00"),
        }),
        item({
          id: "2",
          name: "Must item",
          type: "must",
          lastTendedAt: new Date("2026-05-01T12:00:00"),
        }),
      ],
      now,
    );

    expect(sorted.map((entry) => entry.id)).toEqual(["2", "1"]);
  });

  it("ranks older last tended dates first within the same group", () => {
    const sorted = sortForAttention(
      [
        item({
          id: "1",
          name: "Newer",
          type: "must",
          lastTendedAt: new Date("2026-05-10T12:00:00"),
        }),
        item({
          id: "2",
          name: "Older",
          type: "must",
          lastTendedAt: new Date("2026-04-01T12:00:00"),
        }),
      ],
      now,
    );

    expect(sorted.map((entry) => entry.id)).toEqual(["2", "1"]);
  });

  it("excludes archived items", () => {
    const sorted = sortForAttention(
      [
        item({ id: "1", name: "Archived", archivedAt: new Date("2026-06-01T12:00:00") }),
        item({ id: "2", name: "Active" }),
      ],
      now,
    );

    expect(sorted).toHaveLength(1);
    expect(sorted[0]?.id).toBe("2");
  });

  it("places fresh items after stale groups", () => {
    const sorted = sortForAttention(
      [
        item({ id: "1", name: "Fresh", lastTendedAt: new Date("2026-06-14T12:00:00") }),
        item({ id: "2", name: "Stale", lastTendedAt: new Date("2026-05-01T12:00:00") }),
      ],
      now,
    );

    expect(sorted.map((entry) => entry.id)).toEqual(["2", "1"]);
  });
});

describe("groupForAttention", () => {
  it("groups items into attention sections", () => {
    const groups = groupForAttention(
      [
        item({ id: "1", name: "Fresh plants", lastTendedAt: new Date("2026-06-14T12:00:00") }),
        item({
          id: "2",
          name: "Bed sheets",
          type: "must",
          lastTendedAt: new Date("2026-06-01T12:00:00"),
        }),
        item({
          id: "3",
          name: "Dinner with partner",
          lastTendedAt: new Date("2026-06-10T12:00:00"),
        }),
      ],
      now,
    );

    expect(groups.needsAttention.map((entry) => entry.name)).toContain("Bed sheets");
    expect(groups.gettingStale.map((entry) => entry.name)).toContain("Dinner with partner");
    expect(groups.lookingGood.map((entry) => entry.name)).toContain("Fresh plants");
  });
});
