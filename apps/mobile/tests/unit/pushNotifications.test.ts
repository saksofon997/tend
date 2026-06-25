import { beforeEach, describe, expect, it, mock } from "bun:test";
import { storageCalls } from "../helpers/nativeModuleMocks";
import "../helpers/nativeModuleMocks";

let permissionStatus = "granted";
let cancelScheduledCalls = 0;

mock.module("expo-notifications", () => ({
  AndroidImportance: { DEFAULT: 3 },
  cancelAllScheduledNotificationsAsync: async () => {
    cancelScheduledCalls += 1;
  },
  getDevicePushTokenAsync: async () => {
    return { data: "native-fcm-token-test" };
  },
  getPermissionsAsync: async () => ({ status: permissionStatus }),
  requestPermissionsAsync: async () => ({ status: permissionStatus }),
  setNotificationChannelAsync: async () => undefined,
  setNotificationHandler: () => undefined,
}));

const { clearScheduledPushNotifications, disablePushNotifications, registerForPushNotifications } =
  await import("@api/pushNotifications");

describe("push notifications", () => {
  beforeEach(() => {
    storageCalls.length = 0;
    permissionStatus = "granted";
    cancelScheduledCalls = 0;
  });

  it("registers a native device push token for server-side FCM sends", async () => {
    const result = await registerForPushNotifications();

    expect(result).toEqual({
      status: "registered",
      token: "native-fcm-token-test",
    });
    expect(storageCalls).toEqual([
      { action: "set", key: "tend.pushToken", value: "native-fcm-token-test" },
    ]);
  });

  it("does not store a token when permission is denied", async () => {
    permissionStatus = "denied";

    const result = await registerForPushNotifications();

    expect(result.status).toBe("denied");
    expect(storageCalls).toEqual([]);
  });

  it("clears any local schedules left from older app versions", async () => {
    await clearScheduledPushNotifications();

    expect(cancelScheduledCalls).toBe(1);
  });

  it("removes local token state when notifications are disabled", async () => {
    await disablePushNotifications();

    expect(storageCalls).toEqual([{ action: "remove", key: "tend.pushToken" }]);
    expect(cancelScheduledCalls).toBe(1);
  });
});
