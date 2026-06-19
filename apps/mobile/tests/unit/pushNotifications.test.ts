import { beforeEach, describe, expect, it, mock } from "bun:test";
import { constantsState, storageCalls } from "../helpers/nativeModuleMocks";
import "../helpers/nativeModuleMocks";

let permissionStatus = "granted";
let expoTokenOptions: unknown = null;
let cancelScheduledCalls = 0;

mock.module("expo-notifications", () => ({
  AndroidImportance: { DEFAULT: 3 },
  cancelAllScheduledNotificationsAsync: async () => {
    cancelScheduledCalls += 1;
  },
  getExpoPushTokenAsync: async (options?: unknown) => {
    expoTokenOptions = options ?? null;
    return { data: "ExpoPushToken[test-token]" };
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
    expoTokenOptions = null;
    cancelScheduledCalls = 0;
    Object.assign(constantsState, {
      appOwnership: "standalone",
      easConfig: { projectId: "project-from-eas" },
      expoConfig: { extra: { eas: { projectId: "project-from-config" } } },
    });
  });

  it("registers an Expo push token with the configured project id", async () => {
    const result = await registerForPushNotifications();

    expect(result).toEqual({
      status: "registered",
      token: "ExpoPushToken[test-token]",
    });
    expect(expoTokenOptions).toEqual({ projectId: "project-from-eas" });
    expect(storageCalls).toEqual([
      { action: "set", key: "tend.pushToken", value: "ExpoPushToken[test-token]" },
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
