import { getReminderResponseForUser } from "@/lib/reminders/user-reminders";
import type { Database, PushSubscriptionRow } from "@tend/db";
import {
  deletePushSubscriptionByToken,
  listPushSubscriptions,
  markPushSubscriptionNotified,
} from "@tend/db";
import { sendExpoPushNotification } from "./expo-push";
import type { PushSendResult } from "./expo-push";
import {
  buildTendNotificationRequest,
  shouldSendReminderNotification,
} from "./reminder-notification";
import type { TendNotificationRequest } from "./reminder-notification";

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

export async function runNotificationJob(
  database: Database,
  options: {
    now?: Date;
    sendPush?: SendPushNotification;
  } = {},
): Promise<NotificationJobResult> {
  const now = options.now ?? new Date();
  const sendPush =
    options.sendPush ??
    ((subscription, request) =>
      sendExpoPushNotification({
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
    if (!request || !shouldSendReminderNotification(subscription, request, now)) {
      result.skipped += 1;
      continue;
    }

    const sendResult = await sendPush(subscription, request);
    if (sendResult.ok) {
      await markPushSubscriptionNotified(database, subscription.id, {
        itemId: request.itemId,
        notifiedAt: now,
      });
      result.sent += 1;
      continue;
    }

    if (sendResult.invalidToken) {
      await deletePushSubscriptionByToken(database, subscription.token);
      result.invalidated += 1;
    }
    result.failed += 1;
  }

  return result;
}
