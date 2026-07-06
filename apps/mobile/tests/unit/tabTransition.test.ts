import { describe, expect, it } from "bun:test";
import {
  getTabSwitchDirection,
  getTabTransition,
  getTabTransitionTarget,
  resolveHardwareBackAction,
} from "@utils/tabTransition";

describe("getTabSwitchDirection", () => {
  it("returns 0 when switching to the same tab", () => {
    expect(getTabSwitchDirection("home", "home")).toBe(0);
  });

  it("returns 1 when moving to a later tab", () => {
    expect(getTabSwitchDirection("home", "activity")).toBe(1);
    expect(getTabSwitchDirection("activity", "settings")).toBe(1);
  });

  it("returns -1 when moving to an earlier tab", () => {
    expect(getTabSwitchDirection("settings", "home")).toBe(-1);
    expect(getTabSwitchDirection("checkIn", "add")).toBe(-1);
  });
});

describe("getTabTransition", () => {
  it("keeps ordinary tab switches horizontal", () => {
    expect(getTabTransition("home", "activity")).toEqual({
      axis: "x",
      enterOffset: 18,
      exitOffset: -18,
    });
  });

  it("slides the add screen up from the bottom", () => {
    expect(getTabTransition("home", "add")).toEqual({
      axis: "y",
      enterOffset: 36,
      exitOffset: -12,
    });
  });

  it("slides the add screen down when leaving it", () => {
    expect(getTabTransition("add", "home")).toEqual({
      axis: "y",
      enterOffset: 12,
      exitOffset: 36,
    });
  });
});

describe("getTabTransitionTarget", () => {
  it("renders the next tab immediately while animating it in", () => {
    expect(getTabTransitionTarget("home", "checkIn")).toEqual({
      axis: "x",
      enterOffset: 18,
      exitOffset: -18,
      renderedTab: "checkIn",
    });
  });

  it("keeps the current tab rendered when the tab does not change", () => {
    expect(getTabTransitionTarget("checkIn", "checkIn")).toEqual({
      axis: "x",
      enterOffset: 0,
      exitOffset: 0,
      renderedTab: "checkIn",
    });
  });
});

describe("resolveHardwareBackAction", () => {
  it("keeps the app open on the home tab", () => {
    expect(resolveHardwareBackAction("home")).toEqual({ consume: true });
  });

  it("returns to home from secondary tabs instead of letting Android quit the app", () => {
    expect(resolveHardwareBackAction("add")).toEqual({ consume: true, nextTab: "home" });
    expect(resolveHardwareBackAction("settings")).toEqual({ consume: true, nextTab: "home" });
  });
});
