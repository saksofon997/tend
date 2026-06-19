import { describe, expect, it } from "bun:test";
import "../helpers/nativeModuleMocks";
import {
  deleteRegisteredPushToken,
  isExpoPushToken,
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
  it("recognizes Expo push tokens", () => {
    expect(isExpoPushToken("ExpoPushToken[abc-123]")).toBe(true);
    expect(isExpoPushToken("ExponentPushToken[abc-123]")).toBe(true);
    expect(isExpoPushToken("native-device-token")).toBe(false);
  });

  it("saves the enabled device token to the API", async () => {
    const { api, calls } = pushApi();

    await saveRegisteredPushToken(api, "ExpoPushToken[new-token]", null, "ios");

    expect(calls).toEqual([{ method: "save", platform: "ios", token: "ExpoPushToken[new-token]" }]);
  });

  it("removes a previous server token when enabling refreshes the token", async () => {
    const { api, calls } = pushApi();

    await saveRegisteredPushToken(
      api,
      "ExpoPushToken[new-token]",
      "ExpoPushToken[old-token]",
      "android",
    );

    expect(calls).toEqual([
      { method: "delete", token: "ExpoPushToken[old-token]" },
      { method: "save", platform: "android", token: "ExpoPushToken[new-token]" },
    ]);
  });

  it("uses the stored token fallback when disabling before state is populated", async () => {
    const { api, calls } = pushApi();

    await deleteRegisteredPushToken(api, null, "ExpoPushToken[stored-token]");

    expect(calls).toEqual([{ method: "delete", token: "ExpoPushToken[stored-token]" }]);
  });

  it("does not delete legacy native tokens from the server", async () => {
    const { api, calls } = pushApi();

    await deleteRegisteredPushToken(api, null, "native-device-token");

    expect(calls).toEqual([]);
  });
});
