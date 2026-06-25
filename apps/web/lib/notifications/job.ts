import { getReminderResponseForUser } from "@/lib/reminders/user-reminders";
import type { Database, PushSubscriptionRow } from "@tend/db";
import {
  deletePushSubscriptionByToken,
  listPushSubscriptions,
  markPushSubscriptionNotified,
} from "@tend/db";
import { getMissingFcmConfiguration, sendFcmPushNotification } from "./fcm-push";
import type { PushSendResult } from "./fcm-push";
import {
  buildTendNotificationRequest,
  isNotificationDue,
  shouldSendReminderNotification,
} from "./reminder-notification";
import type { TendNotificationRequest } from "./reminder-notification";

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

export function formatNotificationJobResult(result: NotificationJobResult): string {
  return `checked=${result.checked} sent=${result.sent} skipped=${result.skipped} failed=${result.failed} invalidated=${result.invalidated}`;
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
        data: { itemId: request.itemId },
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

  for (const subscription of subscriptions) {
    result.checked += 1;

    let reminders = remindersByUserId.get(subscription.userId);
    if (!reminders) {
      reminders = await getReminderResponseForUser(database, subscription.userId, now);
      remindersByUserId.set(subscription.userId, reminders);
    }

    const request = buildTendNotificationRequest(reminders);
    if (!request) {
      result.skipped += 1;
      logger.info(
        `Notification skipped: subscriptionId=${subscription.id} userId=${subscription.userId} reason=no_reminder`,
      );
      continue;
    }

    if (!shouldSendReminderNotification(subscription, request, now)) {
      result.skipped += 1;
      const reason = isNotificationDue(request, now) ? "throttled" : "not_due";
      logger.info(
        `Notification skipped: subscriptionId=${subscription.id} userId=${subscription.userId} itemId=${request.itemId} reason=${reason}`,
      );
      continue;
    }

    const sendResult = await sendPush(subscription, request);
    if (sendResult.ok) {
      await markPushSubscriptionNotified(database, subscription.id, {
        itemId: request.itemId,
        notifiedAt: now,
      });
      result.sent += 1;
      logger.info(
        `Notification sent: subscriptionId=${subscription.id} userId=${subscription.userId} itemId=${request.itemId}`,
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
        `Notification send failed: subscriptionId=${subscription.id} userId=${subscription.userId} itemId=${request.itemId} error=${sendResult.error ?? "unknown"}`,
      );
    }
    result.failed += 1;
  }

  logger.info(`Notification job finished: ${formatNotificationJobResult(result)}`);
  return result;
}
