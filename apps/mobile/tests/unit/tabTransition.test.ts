import { describe, expect, it } from "bun:test";
import { getTabSwitchDirection } from "@utils/tabTransition";

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
    expect(getTabSwitchDirection("availability", "add")).toBe(-1);
  });
});
