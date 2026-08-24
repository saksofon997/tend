import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { RemindersApiResponse } from "@/lib/reminders/serialize";
import type { PushSubscriptionRow } from "@tend/db";
import * as actualDb from "@tend/db";

const listPushSubscriptions = mock(() => Promise.resolve([] as PushSubscriptionRow[]));
const markPushSubscriptionNotified = mock(() => Promise.resolve(null));
const markPushSubscriptionWeeklySupport = mock(() => Promise.resolve(null));
const deletePushSubscriptionByToken = mock(() => Promise.resolve());
const getUserSettings = mock(() =>
  Promise.resolve({
    userId: "user-1",
    timezone: "UTC",
    onboardingCompletedAt: new Date("2026-06-01T12:00:00.000Z"),
  }),
);
const listAvailabilityWindowsForUser = mock(() => Promise.resolve([]));
const listRecentEventsForUser = mock(() => Promise.resolve([]));
const getReminderResponseForUser = mock(() =>
  Promise.resolve({
    reminders: [],
    surfaceNow: [],
    nextWindowAt: null,
    inAvailabilityWindow: false,
  } satisfies RemindersApiResponse),
);

mock.module("@tend/db", () => ({
  ...actualDb,
  listPushSubscriptions,
  markPushSubscriptionNotified,
  markPushSubscriptionWeeklySupport,
  deletePushSubscriptionByToken,
  getUserSettings,
  listAvailabilityWindowsForUser,
  listRecentEventsForUser,
}));

mock.module("@/lib/reminders/user-reminders", () => ({
  getReminderResponseForUser,
}));

const { formatNotificationJobResult, runNotificationJob } = await import("@/lib/notifications/job");

function createLogger() {
  const messages: string[] = [];
  return {
    messages,
    logger: {
      info: (message: string) => messages.push(`info:${message}`),
      warn: (message: string) => messages.push(`warn:${message}`),
      error: (message: string) => messages.push(`error:${message}`),
    },
  };
}

function subscription(overrides: Partial<PushSubscriptionRow> = {}): PushSubscriptionRow {
  return {
    id: "sub-1",
    userId: "user-1",
    token: "native-fcm-token-test",
    platform: "ios",
    lastNotifiedItemId: null,
    lastNotifiedAt: null,
    lastWeeklySupportAt: new Date("2026-06-24T12:00:00.000Z"),
    createdAt: new Date("2026-06-01T12:00:00.000Z"),
    updatedAt: new Date("2026-06-01T12:00:00.000Z"),
    ...overrides,
  };
}

describe("notification job", () => {
  beforeEach(() => {
    listPushSubscriptions.mockReset();
    markPushSubscriptionNotified.mockReset();
    markPushSubscriptionWeeklySupport.mockReset();
    deletePushSubscriptionByToken.mockReset();
    getUserSettings.mockReset();
    listAvailabilityWindowsForUser.mockReset();
    listRecentEventsForUser.mockReset();
    getReminderResponseForUser.mockReset();
    listPushSubscriptions.mockImplementation(() => Promise.resolve([]));
    listAvailabilityWindowsForUser.mockImplementation(() => Promise.resolve([]));
    getUserSettings.mockImplementation(() =>
      Promise.resolve({
        userId: "user-1",
        timezone: "UTC",
        onboardingCompletedAt: new Date("2026-06-01T12:00:00.000Z"),
      }),
    );
    listRecentEventsForUser.mockImplementation(() => Promise.resolve([]));
    getReminderResponseForUser.mockImplementation(() =>
      Promise.resolve({
        reminders: [],
        surfaceNow: [],
        nextWindowAt: null,
        inAvailabilityWindow: false,
      }),
    );
  });

  it("formats job result counters", () => {
    expect(
      formatNotificationJobResult({
        checked: 3,
        sent: 1,
        skipped: 1,
        failed: 1,
        invalidated: 0,
      }),
    ).toBe("checked=3 sent=1 skipped=1 failed=1 invalidated=0");
  });

  it("logs job start and finish when there are no subscriptions", async () => {
    const { logger, messages } = createLogger();
    const now = new Date("2026-06-24T12:00:00.000Z");

    const result = await runNotificationJob({} as never, { now, logger });

    expect(result).toEqual({
      checked: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      invalidated: 0,
    });
    expect(messages).toEqual([
      "info:Notification job started: subscriptions=0 at=2026-06-24T12:00:00.000Z",
      "info:Notification job finished: checked=0 sent=0 skipped=0 failed=0 invalidated=0",
    ]);
  });

  it("logs skipped, sent, failed, and invalidated subscription status", async () => {
    const { logger, messages } = createLogger();
    const now = new Date("2026-06-24T12:00:00.000Z");
    listPushSubscriptions.mockImplementation(() =>
      Promise.resolve([
        subscription({ id: "sub-skip", userId: "user-skip" }),
        subscription({
          id: "sub-send",
          userId: "user-send",
          lastNotifiedItemId: null,
          lastNotifiedAt: null,
        }),
        subscription({ id: "sub-fail", userId: "user-fail" }),
        subscription({ id: "sub-invalid", userId: "user-invalid" }),
      ]),
    );

    getReminderResponseForUser.mockImplementation((_database, userId) => {
      if (userId === "user-skip") {
        return Promise.resolve({
          reminders: [],
          surfaceNow: [],
          nextWindowAt: null,
          inAvailabilityWindow: false,
        });
      }

      return Promise.resolve({
        reminders: [],
        surfaceNow: [
          {
            itemId: `${userId}-item`,
            name: "Plants",
            type: "must",
            status: "needs_attention",
            daysSinceLastTended: 4,
            sharedWith: null,
            emphasis: "normal",
            visibility: "now",
            copy: "Plants are starting to drift from their rhythm.",
          },
        ],
        nextWindowAt: null,
        inAvailabilityWindow: true,
      });
    });

    const result = await runNotificationJob({} as never, {
      now,
      logger,
      sendPush: async (_subscription, request) => {
        if (request.itemId === "user-send-item") {
          return { ok: true, invalidToken: false, error: null };
        }
        if (request.itemId === "user-invalid-item") {
          return { ok: false, invalidToken: true, error: "DeviceNotRegistered" };
        }
        return { ok: false, invalidToken: false, error: "Upstream error" };
      },
    });

    expect(result).toEqual({
      checked: 4,
      sent: 1,
      skipped: 1,
      failed: 2,
      invalidated: 1,
    });
    expect(messages).toContain(
      "info:Notification skipped: subscriptionId=sub-skip userId=user-skip reason=no_reminder",
    );
    expect(messages).toContain(
      "info:Notification sent: subscriptionId=sub-send userId=user-send itemId=user-send-item",
    );
    expect(messages).toContain(
      "warn:Notification send failed: subscriptionId=sub-fail userId=user-fail itemId=user-fail-item error=Upstream error",
    );
    expect(messages).toContain(
      "warn:Notification subscription invalidated: subscriptionId=sub-invalid userId=user-invalid",
    );
    expect(messages.at(-1)).toBe(
      "info:Notification job finished: checked=4 sent=1 skipped=1 failed=2 invalidated=1",
    );
  });

  it("sends a weekly support note instead of an item reminder when one is due", async () => {
    const { logger, messages } = createLogger();
    const now = new Date("2026-06-24T12:00:00.000Z");
    listPushSubscriptions.mockImplementation(() =>
      Promise.resolve([
        subscription({
          id: "sub-weekly",
          userId: "user-weekly",
          lastWeeklySupportAt: null,
        }),
      ]),
    );
    listRecentEventsForUser.mockImplementation(() => Promise.resolve([]));

    const result = await runNotificationJob({} as never, {
      now,
      logger,
      sendPush: async (_subscription, request) => {
        expect(request.kind).toBe("weekly_support");
        expect(request.itemId).toBeNull();
        expect(request.title).toContain("small week");
        return { ok: true, invalidToken: false, error: null };
      },
    });

    expect(result.sent).toBe(1);
    expect(markPushSubscriptionWeeklySupport).toHaveBeenCalled();
    expect(markPushSubscriptionNotified).not.toHaveBeenCalled();
    expect(messages).toContain(
      "info:Notification sent: subscriptionId=sub-weekly userId=user-weekly itemId=weekly_support",
    );
  });

  it("sends at most one reminder during an availability window even when the job runs again", async () => {
    const { logger, messages } = createLogger();
    const now = new Date("2026-06-15T18:30:00.000Z");
    listPushSubscriptions.mockImplementation(() =>
      Promise.resolve([
        subscription({
          id: "sub-window",
          userId: "user-window",
          lastNotifiedItemId: "must-1",
          lastNotifiedAt: new Date("2026-06-15T17:00:00.000Z"),
          lastWeeklySupportAt: new Date("2026-06-14T12:00:00.000Z"),
        }),
      ]),
    );
    listAvailabilityWindowsForUser.mockImplementation(() =>
      Promise.resolve([
        {
          id: "window-1",
          userId: "user-window",
          dayOfWeek: 1,
          startTime: "17:00:00",
          endTime: "19:00:00",
        },
      ]),
    );
    getReminderResponseForUser.mockImplementation(() =>
      Promise.resolve({
        reminders: [],
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
        nextWindowAt: null,
        inAvailabilityWindow: true,
      }),
    );

    const result = await runNotificationJob({} as never, {
      now,
      logger,
      sendPush: async () => {
        throw new Error("should not send a second notification in the same window");
      },
    });

    expect(result).toEqual({
      checked: 1,
      sent: 0,
      skipped: 1,
      failed: 0,
      invalidated: 0,
    });
    expect(messages).toContain(
      "info:Notification skipped: subscriptionId=sub-window userId=user-window itemId=want-1 reason=throttled",
    );
  });
});
