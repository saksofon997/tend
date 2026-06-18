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
      body: "Why not tend to something?",
      itemId: "must-1",
      triggerAt: null,
    });
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

  it("returns null when nothing can surface now or later", () => {
    expect(buildTendNotificationRequest(remindersResponse())).toBeNull();
  });
});
