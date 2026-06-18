import type { ReminderResponse, RemindersResponse } from "@/types";
import { isPushNotificationsSupported } from "@utils/pushNotificationsSupport";
import { storage } from "@utils/storage";
import * as Device from "expo-device";
import { Platform } from "react-native";

const PUSH_TOKEN_STORAGE_KEY = "tend.pushToken";
const ANDROID_CHANNEL_ID = "tend-reminders";
const EXPO_GO_UNAVAILABLE_REASON =
  "Push notifications need a development build. Expo Go does not support them.";

export type PushRegistrationResult =
  | {
      status: "registered";
      token: string;
    }
  | {
      status: "denied" | "simulator" | "unavailable";
      reason: string;
    };

export interface TendNotificationRequest {
  title: string;
  body: string;
  itemId: string;
  triggerAt: Date | null;
}

type NotificationsModule = typeof import("expo-notifications");

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let notificationHandlerConfigured = false;

async function loadNotificationsModule(): Promise<NotificationsModule | null> {
  if (!isPushNotificationsSupported()) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications");
  }

  return notificationsModulePromise;
}

async function ensureNotificationHandler(Notifications: NotificationsModule) {
  if (notificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  notificationHandlerConfigured = true;
}

export async function configurePushNotifications() {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  await ensureNotificationHandler(Notifications);

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Tend reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#5c7352",
    });
  }
}

export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  if (!isPushNotificationsSupported()) {
    return {
      status: "unavailable",
      reason: EXPO_GO_UNAVAILABLE_REASON,
    };
  }

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return {
      status: "unavailable",
      reason: EXPO_GO_UNAVAILABLE_REASON,
    };
  }

  await ensureNotificationHandler(Notifications);
  await configurePushNotifications();

  if (!Device.isDevice) {
    return {
      status: "simulator",
      reason: "Push notifications need a physical device.",
    };
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermissions.status;

  if (finalStatus !== "granted") {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== "granted") {
    return {
      status: "denied",
      reason: "Notification permission was not granted.",
    };
  }

  try {
    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    const token = tokenResponse.data;
    await storage.setString(PUSH_TOKEN_STORAGE_KEY, token);

    return {
      status: "registered",
      token,
    };
  } catch {
    return {
      status: "unavailable",
      reason: "Could not create a push token on this device.",
    };
  }
}

export function getStoredPushToken() {
  return storage.getString(PUSH_TOKEN_STORAGE_KEY);
}

export async function disablePushNotifications(): Promise<boolean> {
  await storage.remove(PUSH_TOKEN_STORAGE_KEY);

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return false;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  return true;
}

const NOTIFICATION_BODY_VARIANTS = [
  "When you have a moment, these could use tending.",
  "When you have a moment, this could use tending.",
  "A quiet moment might be enough to tend this.",
  "Take a look when you have a little space.",
] as const;

function stableDayIndex(now: Date, seed: string, variantCount: number): number {
  const dayNumber = Math.floor(now.getTime() / 86_400_000);
  const seedTotal = Array.from(seed).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return (dayNumber + seedTotal) % variantCount;
}

function reminderBody(reminder: ReminderResponse, now: Date): string {
  const index = stableDayIndex(now, reminder.itemId, NOTIFICATION_BODY_VARIANTS.length);
  return NOTIFICATION_BODY_VARIANTS[index];
}

function pickPriorityReminder(reminders: ReminderResponse[]): ReminderResponse | undefined {
  return [...reminders].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "must" ? -1 : 1;
    }

    if (left.status !== right.status) {
      return left.status === "needs_attention" ? -1 : 1;
    }

    const leftDays = left.daysSinceLastTended ?? Number.MAX_SAFE_INTEGER;
    const rightDays = right.daysSinceLastTended ?? Number.MAX_SAFE_INTEGER;
    return rightDays - leftDays;
  })[0];
}

export function buildTendNotificationRequest(
  reminders: RemindersResponse,
  now = new Date(),
): TendNotificationRequest | null {
  if (!reminders.inAvailabilityWindow && reminders.nextWindowAt) {
    const deferredReminder = pickPriorityReminder(reminders.reminders);
    if (!deferredReminder) {
      return null;
    }

    return {
      title: `${deferredReminder.name} could use tending`,
      body: reminderBody(deferredReminder, now),
      itemId: deferredReminder.itemId,
      triggerAt: new Date(reminders.nextWindowAt),
    };
  }

  const immediateReminder = pickPriorityReminder(reminders.surfaceNow);
  if (immediateReminder) {
    return {
      title: `${immediateReminder.name} could use tending`,
      body: reminderBody(immediateReminder, now),
      itemId: immediateReminder.itemId,
      triggerAt: null,
    };
  }

  if (!reminders.nextWindowAt) {
    return null;
  }

  const deferredReminder = pickPriorityReminder(reminders.reminders);
  if (!deferredReminder) {
    return null;
  }

  return {
    title: `${deferredReminder.name} could use tending`,
    body: reminderBody(deferredReminder, now),
    itemId: deferredReminder.itemId,
    triggerAt: new Date(reminders.nextWindowAt),
  };
}

export async function scheduleTendNotification(request: TendNotificationRequest): Promise<boolean> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return false;
  }

  await configurePushNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: request.title,
      body: request.body,
      data: { itemId: request.itemId },
      sound: false,
    },
    trigger: request.triggerAt
      ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: request.triggerAt }
      : null,
  });

  return true;
}
