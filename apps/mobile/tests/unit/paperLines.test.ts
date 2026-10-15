import { describe, expect, it } from "bun:test";
import { PAPER_LINE_HEIGHT, paperLineCount, paperRuleOffset } from "@utils/paperLines";

describe("paper rules", () => {
  it("places the first rule on the Newsreader baseline", () => {
    expect(paperRuleOffset(0)).toBeCloseTo(18.23, 2);
  });

  it("steps each following rule by one line", () => {
    expect(paperRuleOffset(2) - paperRuleOffset(1)).toBe(PAPER_LINE_HEIGHT);
  });

  it("covers the taller of the page and the writing", () => {
    expect(paperLineCount(10, 140)).toBe(5);
    expect(paperLineCount(140, 28)).toBe(5);
    expect(paperLineCount(0, 0)).toBe(1);
  });
});
