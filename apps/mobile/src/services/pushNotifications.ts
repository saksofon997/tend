import { isPushNotificationsSupported } from "@utils/pushNotificationsSupport";
import { storage } from "@utils/storage";
import Constants from "expo-constants";
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

function getExpoProjectId(): string | undefined {
  return Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
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
    const projectId = getExpoProjectId();
    const tokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
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

export async function clearScheduledPushNotifications(): Promise<boolean> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return false;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  return true;
}

export async function disablePushNotifications(): Promise<boolean> {
  await storage.remove(PUSH_TOKEN_STORAGE_KEY);
  return clearScheduledPushNotifications();
}
