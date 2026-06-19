import { describe, expect, it } from "bun:test";
import {
  buildTendNotificationRequest,
  shouldSendReminderNotification,
} from "@/lib/notifications/reminder-notification";
import type { RemindersApiResponse } from "@/lib/reminders/serialize";

function remindersResponse(overrides: Partial<RemindersApiResponse> = {}): RemindersApiResponse {
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
    );

    expect(request).toEqual({
      title: "Medication could use tending",
      body: "Marked as a must, so Tend keeps it easy to see.",
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
    );

    expect(request?.title).toBe("Medication could use tending");
    expect(request?.itemId).toBe("must-1");
    expect(request?.body).toBe("Marked as a must, so Tend keeps it easy to see.");
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
    );

    expect(request?.title).toBe("Bed sheets could use tending");
    expect(request?.body).toBe("Starting to drift from its rhythm, with no rush attached.");
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
    );

    expect(request?.title).toBe("Medication could use tending");
    expect(request?.itemId).toBe("must-1");
    expect(request?.triggerAt?.toISOString()).toBe("2026-06-17T16:00:00.000Z");
  });

  it("returns null when nothing can surface now or later", () => {
    expect(buildTendNotificationRequest(remindersResponse())).toBeNull();
  });
});

describe("shouldSendReminderNotification", () => {
  it("waits until a deferred notification is due", () => {
    expect(
      shouldSendReminderNotification(
        { lastNotifiedAt: null, lastNotifiedItemId: null },
        {
          title: "Bed sheets could use tending",
          body: "Starting to drift from its rhythm, with no rush attached.",
          itemId: "want-1",
          triggerAt: new Date("2026-06-17T16:00:00.000Z"),
        },
        new Date("2026-06-17T15:59:00.000Z"),
      ),
    ).toBe(false);
  });

  it("throttles repeats for the same item within a day", () => {
    expect(
      shouldSendReminderNotification(
        {
          lastNotifiedAt: new Date("2026-06-17T10:00:00.000Z"),
          lastNotifiedItemId: "must-1",
        },
        {
          title: "Medication could use tending",
          body: "Marked as a must, so Tend keeps it easy to see.",
          itemId: "must-1",
          triggerAt: null,
        },
        new Date("2026-06-17T10:30:00.000Z"),
      ),
    ).toBe(false);
  });
});
