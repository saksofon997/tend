import { describe, expect, it } from "bun:test";
import { colors } from "../../src/theme";
import { skeletonColors } from "../../src/utils/skeletonColors";

describe("skeletonColors", () => {
  it("uses muted surface tokens from the app theme", () => {
    expect(skeletonColors.base).toBe(colors.muted);
    expect(skeletonColors.pulse).toBe(colors.borderSubtle);
  });
});
