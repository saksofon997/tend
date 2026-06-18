import { describe, expect, it } from "bun:test";
import { eligibleReminders, remindersToSurfaceNow } from "../src/reminders";
import type { AvailabilityWindow, TendItemInput } from "../src/types";

const now = new Date("2026-06-15T19:00:00");

const mondayEvening: AvailabilityWindow[] = [
  { dayOfWeek: 1, startTime: "18:00", endTime: "22:00" },
];

function item(
  overrides: Partial<TendItemInput> & Pick<TendItemInput, "id" | "name">,
): TendItemInput {
  return {
    type: "want",
    rhythmDays: 7,
    lastTendedAt: new Date("2026-05-01T12:00:00"),
    ...overrides,
  };
}

describe("eligibleReminders", () => {
  it("ignores fresh items", () => {
    const result = eligibleReminders(
      [item({ id: "1", name: "Plants", lastTendedAt: new Date("2026-06-15T12:00:00") })],
      [],
      now,
    );

    expect(result.reminders).toHaveLength(0);
  });

  it("always surfaces musts that need attention", () => {
    const result = eligibleReminders(
      [
        item({
          id: "1",
          name: "Medication",
          type: "must",
          lastTendedAt: new Date("2026-05-01T12:00:00"),
        }),
      ],
      mondayEvening,
      now,
    );

    expect(result.reminders[0]).toMatchObject({
      item: { name: "Medication" },
      emphasis: "strong",
      visibility: "now",
    });
  });

  it("surfaces musts outside availability windows for attention banners", () => {
    const result = eligibleReminders(
      [
        item({
          id: "1",
          name: "Medication",
          type: "must",
          lastTendedAt: new Date("2026-05-01T12:00:00"),
        }),
      ],
      mondayEvening,
      new Date("2026-06-15T12:00:00"),
    );

    expect(result.reminders[0]).toMatchObject({
      item: { name: "Medication" },
      emphasis: "strong",
      visibility: "now",
    });
    expect(result.nextWindowAt).toEqual(new Date("2026-06-15T18:00:00"));
    expect(remindersToSurfaceNow(result)[0]?.item.name).toBe("Medication");
  });

  it("keeps musts ahead of deferred wants outside availability windows", () => {
    const result = eligibleReminders(
      [
        item({ id: "want-1", name: "Bed sheets", type: "want" }),
        item({
          id: "must-1",
          name: "Medication",
          type: "must",
          lastTendedAt: new Date("2026-05-01T12:00:00"),
        }),
      ],
      mondayEvening,
      new Date("2026-06-15T12:00:00"),
    );

    expect(result.reminders.map((reminder) => reminder.item.name)).toEqual([
      "Medication",
      "Bed sheets",
    ]);
    expect(result.reminders.map((reminder) => reminder.visibility)).toEqual(["now", "next_window"]);
  });

  it("defers wants outside availability windows", () => {
    const result = eligibleReminders(
      [item({ id: "1", name: "Bed sheets", type: "want" })],
      mondayEvening,
      new Date("2026-06-15T12:00:00"),
    );

    expect(result.reminders[0]?.visibility).toBe("next_window");
    expect(result.nextWindowAt).toEqual(new Date("2026-06-15T18:00:00"));
    expect(remindersToSurfaceNow(result)).toHaveLength(0);
  });

  it("surfaces wants during availability windows", () => {
    const result = eligibleReminders(
      [item({ id: "1", name: "Bed sheets", type: "want" })],
      mondayEvening,
      now,
    );

    expect(result.inAvailabilityWindow).toBe(true);
    expect(remindersToSurfaceNow(result)[0]?.item.name).toBe("Bed sheets");
  });

  it("surfaces wants without availability windows configured", () => {
    const result = eligibleReminders([item({ id: "1", name: "Vacuum", type: "want" })], [], now);

    expect(remindersToSurfaceNow(result)[0]?.visibility).toBe("now");
  });
});
