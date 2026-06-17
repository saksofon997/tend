import { afterEach, describe, expect, it, mock } from "bun:test";

const constantsState = {
  appOwnership: "standalone" as string | null,
};

mock.module("expo-constants", () => ({
  default: constantsState,
}));

const platformState = {
  OS: "android" as string,
};

mock.module("react-native", () => ({
  Platform: platformState,
}));

const { isPushNotificationsSupported } = await import("@utils/pushNotificationsSupport");

describe("isPushNotificationsSupported", () => {
  afterEach(() => {
    constantsState.appOwnership = "standalone";
    platformState.OS = "android";
  });

  it("returns false in Expo Go", () => {
    constantsState.appOwnership = "expo";
    expect(isPushNotificationsSupported()).toBe(false);
  });

  it("returns false on web", () => {
    platformState.OS = "web";
    expect(isPushNotificationsSupported()).toBe(false);
  });

  it("returns true for standalone app builds", () => {
    constantsState.appOwnership = "standalone";
    expect(isPushNotificationsSupported()).toBe(true);
  });
});
