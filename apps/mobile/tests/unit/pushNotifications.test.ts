import { describe, expect, it, mock } from "bun:test";
import "../helpers/nativeModuleMocks";
import type { RemindersResponse } from "@/types";

mock.module("expo-device", () => ({
  default: { isDevice: true },
}));

mock.module("@utils/storage", () => ({
  storage: {
    getString: async () => null,
    setString: async () => undefined,
  },
}));

const { buildTendNotificationRequest } = await import("@api/pushNotifications");

function remindersResponse(overrides: Partial<RemindersResponse> = {}): RemindersResponse {
  return {
    reminders: [],
    surfaceNow: [],
    nextWindowAt: null,
    inAvailabilityWindow: false,
    ...overrides,
  };
}

describe("buildTendNotificationRequest", () => {
  it("uses the first surface-now reminder", () => {
    const request = buildTendNotificationRequest(
      remindersResponse({
        surfaceNow: [
          {
            itemId: "must-1",
            name: "Medication",
            type: "must",
            status: "needs_attention",
            daysSinceLastTended: 2,
            emphasis: "strong",
            visibility: "now",
            copy: "Medication is marked as a must and needs attention.",
          },
        ],
      }),
      new Date("2026-06-17T10:00:00.000Z"),
    );

    expect(request).toEqual({
      title: "Medication could use tending",
      body: "When you have a moment, these could use tending.",
      itemId: "must-1",
      triggerAt: null,
    });
  });

  it("uses musts before wants for immediate notification titles", () => {
    const request = buildTendNotificationRequest(
      remindersResponse({
        surfaceNow: [
          {
            itemId: "want-1",
            name: "Bed sheets",
            type: "want",
            status: "needs_attention",
            daysSinceLastTended: 14,
            emphasis: "normal",
            visibility: "now",
            copy: "Bed sheets needs attention.",
          },
          {
            itemId: "must-1",
            name: "Medication",
            type: "must",
            status: "getting_stale",
            daysSinceLastTended: 2,
            emphasis: "strong",
            visibility: "now",
            copy: "Medication is marked as a must and is getting stale.",
          },
        ],
      }),
      new Date("2026-06-17T10:00:00.000Z"),
    );

    expect(request?.title).toBe("Medication could use tending");
    expect(request?.itemId).toBe("must-1");
  });

  it("defers surface-now musts until the next availability window for notifications", () => {
    const request = buildTendNotificationRequest(
      remindersResponse({
        nextWindowAt: "2026-06-17T16:00:00.000Z",
        inAvailabilityWindow: false,
        surfaceNow: [
          {
            itemId: "must-1",
            name: "Medication",
            type: "must",
            status: "needs_attention",
            daysSinceLastTended: 2,
            emphasis: "strong",
            visibility: "now",
            copy: "Medication is marked as a must and needs attention.",
          },
        ],
        reminders: [
          {
            itemId: "must-1",
            name: "Medication",
            type: "must",
            status: "needs_attention",
            daysSinceLastTended: 2,
            emphasis: "strong",
            visibility: "now",
            copy: "Medication is marked as a must and needs attention.",
          },
          {
            itemId: "want-1",
            name: "Bed sheets",
            type: "want",
            status: "getting_stale",
            daysSinceLastTended: 8,
            emphasis: "normal",
            visibility: "next_window",
            copy: "Bed sheets was last tended 8 days ago.",
          },
        ],
      }),
      new Date("2026-06-17T10:00:00.000Z"),
    );

    expect(request?.title).toBe("Medication could use tending");
    expect(request?.itemId).toBe("must-1");
    expect(request?.triggerAt?.toISOString()).toBe("2026-06-17T16:00:00.000Z");
  });

  it("schedules deferred wants for the next availability window", () => {
    const request = buildTendNotificationRequest(
      remindersResponse({
        nextWindowAt: "2026-06-17T16:00:00.000Z",
        reminders: [
          {
            itemId: "want-1",
            name: "Bed sheets",
            type: "want",
            status: "getting_stale",
            daysSinceLastTended: 8,
            emphasis: "normal",
            visibility: "next_window",
            copy: "Bed sheets was last tended 8 days ago.",
          },
        ],
      }),
      new Date("2026-06-17T10:00:00.000Z"),
    );

    expect(request?.title).toBe("Bed sheets could use tending");
    expect(request?.triggerAt?.toISOString()).toBe("2026-06-17T16:00:00.000Z");
  });

  it("uses musts before wants for deferred notification titles", () => {
    const request = buildTendNotificationRequest(
      remindersResponse({
        nextWindowAt: "2026-06-17T16:00:00.000Z",
        reminders: [
          {
            itemId: "want-1",
            name: "Bed sheets",
            type: "want",
            status: "needs_attention",
            daysSinceLastTended: 14,
            emphasis: "normal",
            visibility: "next_window",
            copy: "Bed sheets needs attention.",
          },
          {
            itemId: "must-1",
            name: "Medication",
            type: "must",
            status: "getting_stale",
            daysSinceLastTended: 2,
            emphasis: "strong",
            visibility: "next_window",
            copy: "Medication is marked as a must and is getting stale.",
          },
        ],
      }),
      new Date("2026-06-17T10:00:00.000Z"),
    );

    expect(request?.title).toBe("Medication could use tending");
    expect(request?.itemId).toBe("must-1");
    expect(request?.triggerAt?.toISOString()).toBe("2026-06-17T16:00:00.000Z");
  });

  it("returns null when nothing can surface now or later", () => {
    expect(buildTendNotificationRequest(remindersResponse())).toBeNull();
  });
});
