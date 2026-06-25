import { describe, expect, it } from "bun:test";
import "../helpers/nativeModuleMocks";
import {
  deleteRegisteredPushToken,
  isLegacyExpoPushToken,
  isNativePushToken,
  saveRegisteredPushToken,
} from "@hooks/usePushNotifications";

function pushApi() {
  const calls: Array<{ method: "delete" | "save"; token: string; platform?: "ios" | "android" }> =
    [];

  return {
    calls,
    api: {
      deletePushSubscription: async (token: string) => {
        calls.push({ method: "delete", token });
      },
      savePushSubscription: async (token: string, platform: "ios" | "android") => {
        calls.push({ method: "save", platform, token });
      },
    },
  };
}

describe("push notification subscription sync", () => {
  it("recognizes native tokens and legacy Expo tokens", () => {
    expect(isLegacyExpoPushToken("ExpoPushToken[abc-123]")).toBe(true);
    expect(isLegacyExpoPushToken("ExponentPushToken[abc-123]")).toBe(true);
    expect(isNativePushToken("native-device-token")).toBe(true);
    expect(isNativePushToken("ExpoPushToken[abc-123]")).toBe(false);
  });

  it("saves the enabled device token to the API", async () => {
    const { api, calls } = pushApi();

    await saveRegisteredPushToken(api, "native-fcm-token-new", null, "ios");

    expect(calls).toEqual([{ method: "save", platform: "ios", token: "native-fcm-token-new" }]);
  });

  it("removes a previous server token when enabling refreshes the token", async () => {
    const { api, calls } = pushApi();

    await saveRegisteredPushToken(api, "native-fcm-token-new", "native-fcm-token-old", "android");

    expect(calls).toEqual([
      { method: "delete", token: "native-fcm-token-old" },
      { method: "save", platform: "android", token: "native-fcm-token-new" },
    ]);
  });

  it("uses the stored token fallback when disabling before state is populated", async () => {
    const { api, calls } = pushApi();

    await deleteRegisteredPushToken(api, null, "native-fcm-token-stored");

    expect(calls).toEqual([{ method: "delete", token: "native-fcm-token-stored" }]);
  });

  it("deletes legacy Expo tokens from the server when disabling", async () => {
    const { api, calls } = pushApi();

    await deleteRegisteredPushToken(api, null, "ExpoPushToken[stored-token]");

    expect(calls).toEqual([{ method: "delete", token: "ExpoPushToken[stored-token]" }]);
  });
});
