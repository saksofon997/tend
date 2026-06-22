import { describe, expect, it } from "bun:test";
import {
  buildAggregatedReminderCopy,
  buildFreeTimeReminderHeadline,
  buildReminderCopy,
  freeTimePhrase,
  pickFreeTimeHeadlineVariantIndex,
} from "@/lib/reminders/reminder-copy";

const sampleReminder = {
  name: "Bed sheets",
  type: "want" as const,
  status: "needs_attention" as const,
  daysSinceLastTended: 11,
  emphasis: "normal" as const,
};

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

    expect(copy).toBe("Bed sheets was last tended 11 days ago.");
  });

  it("formats Serbian reminder copy", () => {
    const copy = buildReminderCopy(
      {
        name: "Posteljina",
        type: "want",
        status: "getting_stale",
        daysSinceLastTended: 11,
        emphasis: "normal",
      },
      "sr",
    );

    expect(copy).toBe("Posteljina je poslednji put tendovano pre 11 dana.");
  });
});

describe("buildFreeTimeReminderHeadline", () => {
  const evening = new Date("2026-06-15T19:00:00");

  it("rotates through headline variants by day", () => {
    const variantCount = 4;
    const dayZero = new Date("1970-01-01T12:00:00");
    const dayOne = new Date("1970-01-02T12:00:00");

    expect(pickFreeTimeHeadlineVariantIndex(dayZero, variantCount)).toBe(0);
    expect(pickFreeTimeHeadlineVariantIndex(dayOne, variantCount)).toBe(1);
  });

  it("uses this for one reminder and these for multiple", () => {
    const dayWithVariantTwo = new Date("1970-01-03T19:00:00");
    expect(pickFreeTimeHeadlineVariantIndex(dayWithVariantTwo, 4)).toBe(2);

    expect(buildFreeTimeReminderHeadline(dayWithVariantTwo, 1)).toBe(
      "When you have a moment, this could use tending:",
    );
    expect(buildFreeTimeReminderHeadline(dayWithVariantTwo, 2)).toBe(
      "When you have a moment, these could use tending:",
    );
  });

  it("includes the part of day when the variant uses it", () => {
    const morning = new Date("2026-06-16T09:00:00");
    const variantIndex = pickFreeTimeHeadlineVariantIndex(morning, 4);

    if (variantIndex === 1) {
      expect(buildFreeTimeReminderHeadline(morning, 1)).toBe(
        "A quiet moment this morning. Take a look at what needs attention:",
      );
    }

    if (variantIndex === 3) {
      expect(buildFreeTimeReminderHeadline(morning, 1)).toBe(
        "If you have a spare moment this morning, this could use a look:",
      );
    }
  });
});

describe("buildAggregatedReminderCopy", () => {
  it("returns empty copy when there are no reminders", () => {
    expect(buildAggregatedReminderCopy([], new Date("2026-06-15T19:00:00"))).toBe("");
  });

  it("delegates to the rotating free-time headline without item names", () => {
    const evening = new Date("2026-06-15T19:00:00");

    expect(buildAggregatedReminderCopy([sampleReminder], evening)).toBe(
      "If you have a spare moment this evening, this could use a look:",
    );

    expect(
      buildAggregatedReminderCopy(
        [sampleReminder, { ...sampleReminder, name: "Vacuuming", daysSinceLastTended: 9 }],
        evening,
      ),
    ).toBe("If you have a spare moment this evening, these could use a look:");
  });
});

describe("freeTimePhrase", () => {
  it("returns evening after 5pm", () => {
    expect(freeTimePhrase(new Date("2026-06-15T19:00:00"))).toBe("this evening");
  });

  it("returns Serbian time phrases", () => {
    expect(freeTimePhrase(new Date("2026-06-15T19:00:00"), "sr")).toBe("ove večeri");
  });
});
