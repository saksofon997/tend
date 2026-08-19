import { describe, expect, it } from "bun:test";
import { HANDS_GIVING_ICON_PATHS, HANDS_GIVING_ICON_VIEWBOX } from "../src/hands-giving-icon";

describe("hands-giving converted glyph", () => {
  it("keeps the four converted path transforms", () => {
    expect(HANDS_GIVING_ICON_VIEWBOX).toBe("0 0 512 512");
    expect(HANDS_GIVING_ICON_PATHS).toHaveLength(4);
    expect(HANDS_GIVING_ICON_PATHS.map((path) => path.transform)).toEqual([
      "translate(206.43603515625,91.693603515625)",
      "translate(161.642578125,243.4130859375)",
      "translate(455.2890625,148.61328125)",
      "translate(95.875,153.8125)",
    ]);
  });

  it("starts from the converted path data, not a redrawn glyph", () => {
    expect(HANDS_GIVING_ICON_PATHS[0].d.startsWith("M0 0 C20.92626666 11.7919595")).toBe(true);
    expect(HANDS_GIVING_ICON_PATHS[1].d.startsWith("M0 0 C1.63650172 1.6837077")).toBe(true);
    expect(HANDS_GIVING_ICON_PATHS[2].d.startsWith("M0 0 C6.54067173 5.30122937")).toBe(true);
    expect(HANDS_GIVING_ICON_PATHS[3].d.startsWith("M0 0 C10.39841007 8.13075106")).toBe(true);
  });
});
