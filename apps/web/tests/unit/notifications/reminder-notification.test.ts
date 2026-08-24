import { describe, expect, it } from "bun:test";
import {
  buildTendNotificationRequest,
  latestNotificationAt,
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
            sharedWith: null,
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
            sharedWith: null,
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
            sharedWith: null,
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
            sharedWith: null,
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
            sharedWith: null,
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
            sharedWith: null,
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

  it("does not notify for getting-stale wants", () => {
    const request = buildTendNotificationRequest(
      remindersResponse({
        inAvailabilityWindow: true,
        surfaceNow: [
          {
            itemId: "want-1",
            name: "Bed sheets",
            type: "want",
            status: "getting_stale",
            daysSinceLastTended: 8,
            sharedWith: null,
            emphasis: "normal",
            visibility: "now",
            copy: "Bed sheets was last tended 8 days ago.",
          },
        ],
        reminders: [
          {
            itemId: "want-1",
            name: "Bed sheets",
            type: "want",
            status: "getting_stale",
            daysSinceLastTended: 8,
            sharedWith: null,
            emphasis: "normal",
            visibility: "now",
            copy: "Bed sheets was last tended 8 days ago.",
          },
        ],
      }),
    );

    expect(request).toBeNull();
  });

  it("schedules deferred needs-attention wants for the next availability window", () => {
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
            sharedWith: null,
            emphasis: "normal",
            visibility: "next_window",
            copy: "Bed sheets needs attention.",
          },
        ],
      }),
    );

    expect(request?.title).toBe("Bed sheets could use tending");
    expect(request?.body).toBe("Past its usual rhythm. Take a look when there is room.");
    expect(request?.triggerAt?.toISOString()).toBe("2026-06-17T16:00:00.000Z");
  });

  it("notifies needs-attention wants when no musts need a nudge", () => {
    const request = buildTendNotificationRequest(
      remindersResponse({
        inAvailabilityWindow: true,
        surfaceNow: [
          {
            itemId: "want-1",
            name: "Bed sheets",
            type: "want",
            status: "needs_attention",
            daysSinceLastTended: 14,
            sharedWith: null,
            emphasis: "normal",
            visibility: "now",
            copy: "Bed sheets needs attention.",
          },
        ],
      }),
    );

    expect(request?.title).toBe("Bed sheets could use tending");
    expect(request?.itemId).toBe("want-1");
    expect(request?.body).toBe("Past its usual rhythm. Take a look when there is room.");
  });

  it("ranks needs-attention musts ahead of getting-stale musts and needs-attention wants", () => {
    const request = buildTendNotificationRequest(
      remindersResponse({
        inAvailabilityWindow: true,
        surfaceNow: [
          {
            itemId: "want-1",
            name: "Bed sheets",
            type: "want",
            status: "needs_attention",
            daysSinceLastTended: 21,
            sharedWith: null,
            emphasis: "normal",
            visibility: "now",
            copy: "Bed sheets needs attention.",
          },
          {
            itemId: "must-stale",
            name: "Pet food",
            type: "must",
            status: "getting_stale",
            daysSinceLastTended: 12,
            sharedWith: null,
            emphasis: "strong",
            visibility: "now",
            copy: "Pet food is marked as a must and is getting stale.",
          },
          {
            itemId: "must-attention",
            name: "Medication",
            type: "must",
            status: "needs_attention",
            daysSinceLastTended: 3,
            sharedWith: null,
            emphasis: "strong",
            visibility: "now",
            copy: "Medication is marked as a must and needs attention.",
          },
        ],
      }),
    );

    expect(request?.itemId).toBe("must-attention");
    expect(request?.title).toBe("Medication could use tending");
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
            sharedWith: null,
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
            sharedWith: null,
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

  it("throttles a different item within a day when no availability window is configured", () => {
    expect(
      shouldSendReminderNotification(
        {
          lastNotifiedAt: new Date("2026-06-17T10:00:00.000Z"),
          lastNotifiedItemId: "must-1",
        },
        {
          title: "Bed sheets could use tending",
          body: "Past its usual rhythm. Take a look when there is room.",
          itemId: "want-1",
          triggerAt: null,
        },
        new Date("2026-06-17T10:30:00.000Z"),
      ),
    ).toBe(false);
  });

  it("does not send again later in the same availability window even for a different item", () => {
    const windows = [{ dayOfWeek: 1, startTime: "17:00", endTime: "19:00" }];
    const lastNotifiedAtLocal = new Date("2026-06-15T17:00:00");
    const localNow = new Date("2026-06-15T18:30:00");

    expect(
      shouldSendReminderNotification(
        {
          lastNotifiedAt: lastNotifiedAtLocal,
          lastNotifiedItemId: "must-1",
        },
        {
          title: "Bed sheets could use tending",
          body: "Past its usual rhythm. Take a look when there is room.",
          itemId: "want-1",
          triggerAt: null,
        },
        localNow,
        { windows, localNow, lastNotifiedAtLocal },
      ),
    ).toBe(false);
  });

  it("sends at the start of the next day's matching window", () => {
    const windows = [
      { dayOfWeek: 1, startTime: "17:00", endTime: "19:00" },
      { dayOfWeek: 2, startTime: "17:00", endTime: "19:00" },
    ];
    const lastNotifiedAtLocal = new Date("2026-06-15T17:00:00");
    const localNow = new Date("2026-06-16T17:00:00");

    expect(
      shouldSendReminderNotification(
        {
          lastNotifiedAt: lastNotifiedAtLocal,
          lastNotifiedItemId: "must-1",
        },
        {
          title: "Medication could use tending",
          body: "Marked as a must, so Tend keeps it easy to see.",
          itemId: "must-1",
          triggerAt: null,
        },
        localNow,
        { windows, localNow, lastNotifiedAtLocal },
      ),
    ).toBe(true);
  });
});

describe("latestNotificationAt", () => {
  it("returns the later of reminder and weekly support timestamps", () => {
    expect(
      latestNotificationAt(
        new Date("2026-06-15T17:00:00.000Z"),
        new Date("2026-06-01T12:00:00.000Z"),
      )?.toISOString(),
    ).toBe("2026-06-15T17:00:00.000Z");
  });
});
