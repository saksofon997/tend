import { afterEach, describe, expect, it } from "bun:test";
import { constantsState, platformState } from "../helpers/nativeModuleMocks";

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
