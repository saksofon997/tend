import { describe, expect, it } from "bun:test";
import { getAttentionSectionDefaults } from "../../src/utils/homeGroups";

describe("getAttentionSectionDefaults", () => {
  it("opens needs attention when that group has items", () => {
    expect(getAttentionSectionDefaults(2, 3)).toEqual({
      needsAttention: true,
      gettingStale: false,
      lookingGood: false,
    });
  });

  it("opens getting stale when needs attention is empty", () => {
    expect(getAttentionSectionDefaults(0, 4)).toEqual({
      needsAttention: false,
      gettingStale: true,
      lookingGood: false,
    });
  });

  it("keeps looking good collapsed by default", () => {
    expect(getAttentionSectionDefaults(0, 0)).toEqual({
      needsAttention: false,
      gettingStale: false,
      lookingGood: false,
    });
  });
});
