import { toDomainAvailabilityWindow } from "@/lib/availability/serialize";
import { getReminderResponseForUser } from "@/lib/reminders/user-reminders";
import type { Database, PushSubscriptionRow, RecentEventWithItem } from "@tend/db";
import {
  deletePushSubscriptionByToken,
  getUserSettings,
  listAvailabilityWindowsForUser,
  listPushSubscriptions,
  listRecentEventsForUser,
  markPushSubscriptionNotified,
  markPushSubscriptionWeeklySupport,
} from "@tend/db";
import {
  type AvailabilityWindow,
  isValidTimeZone,
  isWeeklySupportDue,
  localDateInTimeZone,
  weeklySupportCopy,
  weeklySupportLookbackStart,
} from "@tend/domain";
import { getMissingFcmConfiguration, sendFcmPushNotification } from "./fcm-push";
import type { PushSendResult } from "./fcm-push";
import {
  type ReminderNotificationThrottleContext,
  type TendNotificationRequest,
  buildTendNotificationRequest,
  isNotificationDue,
  latestNotificationAt,
  shouldSendReminderNotification,
} from "./reminder-notification";

export interface NotificationJobLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
}

export interface NotificationJobResult {
  checked: number;
  sent: number;
  skipped: number;
  failed: number;
  invalidated: number;
}

export type SendPushNotification = (
  subscription: PushSubscriptionRow,
  request: TendNotificationRequest,
) => Promise<PushSendResult>;

const WEEKLY_SUPPORT_EVENT_LIMIT = 200;

export function formatNotificationJobResult(result: NotificationJobResult): string {
  return `checked=${result.checked} sent=${result.sent} skipped=${result.skipped} failed=${result.failed} invalidated=${result.invalidated}`;
}

export function notificationPushData(request: TendNotificationRequest): Record<string, string> {
  if (request.kind === "weekly_support" || !request.itemId) {
    return { kind: "weekly_support" };
  }

  return { itemId: request.itemId };
}

function requestLabel(request: TendNotificationRequest): string {
  return request.itemId ?? "weekly_support";
}

export async function runNotificationJob(
  database: Database,
  options: {
    now?: Date;
    sendPush?: SendPushNotification;
    logger?: NotificationJobLogger;
  } = {},
): Promise<NotificationJobResult> {
  const logger = options.logger ?? console;
  const now = options.now ?? new Date();
  const sendPush =
    options.sendPush ??
    ((subscription, request) =>
      sendFcmPushNotification({
        to: subscription.token,
        title: request.title,
        body: request.body,
        data: notificationPushData(request),
      }));

  const result: NotificationJobResult = {
    checked: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    invalidated: 0,
  };

  const subscriptions = await listPushSubscriptions(database);
  logger.info(
    `Notification job started: subscriptions=${subscriptions.length} at=${now.toISOString()}`,
  );
  const missingFcmConfiguration = getMissingFcmConfiguration();
  if (subscriptions.length > 0 && missingFcmConfiguration.length > 0) {
    logger.error(
      `Notification job cannot send FCM pushes until configuration is complete: missing=${missingFcmConfiguration.join(",")}`,
    );
  }

  const remindersByUserId = new Map<
    string,
    Awaited<ReturnType<typeof getReminderResponseForUser>>
  >();
  const settingsByUserId = new Map<string, Awaited<ReturnType<typeof getUserSettings>>>();
  const weeklyEventsByUserId = new Map<string, RecentEventWithItem[]>();
  const windowsByUserId = new Map<string, AvailabilityWindow[]>();

  for (const subscription of subscriptions) {
    result.checked += 1;

    const weeklyRequest = await buildWeeklySupportRequestIfDue(
      database,
      subscription,
      now,
      settingsByUserId,
      weeklyEventsByUserId,
    );
    const request =
      weeklyRequest ??
      (await reminderRequestForSubscription(database, subscription.userId, now, remindersByUserId));

    if (!request) {
      result.skipped += 1;
      logger.info(
        `Notification skipped: subscriptionId=${subscription.id} userId=${subscription.userId} reason=no_reminder`,
      );
      continue;
    }

    const throttleContext = await throttleContextForSubscription(
      database,
      subscription,
      now,
      settingsByUserId,
      windowsByUserId,
    );

    if (!shouldSendReminderNotification(subscription, request, now, throttleContext)) {
      result.skipped += 1;
      const reason = isNotificationDue(request, now) ? "throttled" : "not_due";
      logger.info(
        `Notification skipped: subscriptionId=${subscription.id} userId=${subscription.userId} itemId=${requestLabel(request)} reason=${reason}`,
      );
      continue;
    }

    const sendResult = await sendPush(subscription, request);
    if (sendResult.ok) {
      if (request.kind === "weekly_support") {
        await markPushSubscriptionWeeklySupport(database, subscription.id, now);
      } else if (request.itemId) {
        await markPushSubscriptionNotified(database, subscription.id, {
          itemId: request.itemId,
          notifiedAt: now,
        });
      }
      result.sent += 1;
      logger.info(
        `Notification sent: subscriptionId=${subscription.id} userId=${subscription.userId} itemId=${requestLabel(request)}`,
      );
      continue;
    }

    if (sendResult.invalidToken) {
      await deletePushSubscriptionByToken(database, subscription.token);
      result.invalidated += 1;
      logger.warn(
        `Notification subscription invalidated: subscriptionId=${subscription.id} userId=${subscription.userId}`,
      );
    } else {
      logger.warn(
        `Notification send failed: subscriptionId=${subscription.id} userId=${subscription.userId} itemId=${requestLabel(request)} error=${sendResult.error ?? "unknown"}`,
      );
    }
    result.failed += 1;
  }

  logger.info(`Notification job finished: ${formatNotificationJobResult(result)}`);
  return result;
}

async function reminderRequestForSubscription(
  database: Database,
  userId: string,
  now: Date,
  remindersByUserId: Map<string, Awaited<ReturnType<typeof getReminderResponseForUser>>>,
): Promise<TendNotificationRequest | null> {
  let reminders = remindersByUserId.get(userId);
  if (!reminders) {
    reminders = await getReminderResponseForUser(database, userId, now);
    remindersByUserId.set(userId, reminders);
  }

  return buildTendNotificationRequest(reminders);
}

async function throttleContextForSubscription(
  database: Database,
  subscription: PushSubscriptionRow,
  now: Date,
  settingsByUserId: Map<string, Awaited<ReturnType<typeof getUserSettings>>>,
  windowsByUserId: Map<string, AvailabilityWindow[]>,
): Promise<ReminderNotificationThrottleContext> {
  let settings = settingsByUserId.get(subscription.userId);
  if (settings === undefined) {
    settings = await getUserSettings(database, subscription.userId);
    settingsByUserId.set(subscription.userId, settings);
  }

  const timezone =
    settings?.timezone && isValidTimeZone(settings.timezone) ? settings.timezone : "UTC";

  let windows = windowsByUserId.get(subscription.userId);
  if (!windows) {
    const rows = await listAvailabilityWindowsForUser(database, subscription.userId);
    windows = rows.map(toDomainAvailabilityWindow);
    windowsByUserId.set(subscription.userId, windows);
  }

  const lastPushAt = latestNotificationAt(
    subscription.lastNotifiedAt,
    subscription.lastWeeklySupportAt,
  );

  return {
    windows,
    localNow: localDateInTimeZone(now, timezone),
    lastNotifiedAtLocal: lastPushAt ? localDateInTimeZone(lastPushAt, timezone) : null,
  };
}

async function buildWeeklySupportRequestIfDue(
  database: Database,
  subscription: PushSubscriptionRow,
  now: Date,
  settingsByUserId: Map<string, Awaited<ReturnType<typeof getUserSettings>>>,
  weeklyEventsByUserId: Map<string, RecentEventWithItem[]>,
): Promise<TendNotificationRequest | null> {
  let settings = settingsByUserId.get(subscription.userId);
  if (settings === undefined) {
    settings = await getUserSettings(database, subscription.userId);
    settingsByUserId.set(subscription.userId, settings);
  }

  const timezone =
    settings?.timezone && isValidTimeZone(settings.timezone) ? settings.timezone : "UTC";

  if (
    !isWeeklySupportDue(now, timezone, subscription.lastWeeklySupportAt, subscription.createdAt)
  ) {
    return null;
  }

  let events = weeklyEventsByUserId.get(subscription.userId);
  if (!events) {
    events = await listRecentEventsForUser(
      database,
      subscription.userId,
      WEEKLY_SUPPORT_EVENT_LIMIT,
      {
        from: weeklySupportLookbackStart(now),
      },
    );
    weeklyEventsByUserId.set(subscription.userId, events);
  }

  const copy = weeklySupportCopy(events.length);
  return {
    title: copy.title,
    body: copy.body,
    itemId: null,
    triggerAt: null,
    kind: "weekly_support",
  };
}
