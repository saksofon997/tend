import { afterEach, describe, expect, it } from "bun:test";
import { constantsState, platformState } from "../helpers/nativeModuleMocks";

// On CI, pushNotifications.test.ts runs before pushNotificationsSupport.test.ts and
// loads this module graph first. Mutable shared mocks must stay controllable afterward.
await import("@api/pushNotifications");
const { isPushNotificationsSupported } = await import("@utils/pushNotificationsSupport");

describe("isPushNotificationsSupported after pushNotifications module load", () => {
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
