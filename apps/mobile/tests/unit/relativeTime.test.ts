import { describe, expect, it } from "bun:test";
import { formatRelativeFromDays } from "../../src/utils/relativeTime";

describe("formatRelativeFromDays", () => {
  it("returns never tended when days are unknown", () => {
    expect(formatRelativeFromDays(null)).toBe("Never tended");
  });

  it("returns today wording", () => {
    expect(formatRelativeFromDays(0)).toBe("Last tended today");
  });

  it("returns yesterday wording", () => {
    expect(formatRelativeFromDays(1)).toBe("Last tended yesterday");
  });

  it("returns day count wording", () => {
    expect(formatRelativeFromDays(11)).toBe("Last tended 11 days ago");
  });
});
