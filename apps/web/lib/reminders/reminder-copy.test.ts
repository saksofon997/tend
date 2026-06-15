import { describe, expect, it } from "bun:test";
import { buildAggregatedReminderCopy, buildReminderCopy, freeTimePhrase } from "./reminder-copy";

describe("buildReminderCopy", () => {
  it("uses must-specific copy for musts needing attention", () => {
    const copy = buildReminderCopy({
      name: "Medication",
      type: "must",
      status: "needs_attention",
      daysSinceLastTended: 11,
      emphasis: "strong",
    });

    expect(copy).toBe("Medication is marked as a must and needs attention.");
  });

  it("describes days since last tended for wants", () => {
    const copy = buildReminderCopy({
      name: "Bed sheets",
      type: "want",
      status: "getting_stale",
      daysSinceLastTended: 11,
      emphasis: "normal",
    });

    expect(copy).toBe("Your Bed sheets was last tended 11 days ago.");
  });
});

describe("buildAggregatedReminderCopy", () => {
  it("lists multiple item names with a free-time phrase", () => {
    const copy = buildAggregatedReminderCopy(
      [
        {
          name: "Bed sheets",
          type: "want",
          status: "needs_attention",
          daysSinceLastTended: 11,
          emphasis: "normal",
        },
        {
          name: "Vacuuming",
          type: "want",
          status: "needs_attention",
          daysSinceLastTended: 9,
          emphasis: "normal",
        },
      ],
      new Date("2026-06-15T19:00:00"),
    );

    expect(copy).toBe(
      "You have free time this evening. Bed sheets and Vacuuming could use attention.",
    );
  });
});

describe("freeTimePhrase", () => {
  it("returns evening after 5pm", () => {
    expect(freeTimePhrase(new Date("2026-06-15T19:00:00"))).toBe("this evening");
  });
});
