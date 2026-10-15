import { describe, expect, it } from "bun:test";
import { dewDropHidesOnTab, dewDropLeft, dewDropLift } from "@utils/dewDrop";

describe("dew drop tab marker", () => {
  it("centers the drop on a tab", () => {
    expect(dewDropLeft(120)).toBe(100);
  });

  it("lifts while traveling and stays put when motion is reduced", () => {
    expect(dewDropLift(false)).toBeLessThan(0);
    expect(dewDropLift(true)).toBe(0);
  });

  it("hides the sliding drop on the add control", () => {
    expect(dewDropHidesOnTab("add")).toBe(true);
    expect(dewDropHidesOnTab("home")).toBe(false);
    expect(dewDropHidesOnTab("reflections")).toBe(false);
  });
});
