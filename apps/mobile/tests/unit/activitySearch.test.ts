import { describe, expect, it } from "bun:test";
import { buildActivityListQuery } from "../../src/utils/activitySearch";

describe("buildActivityListQuery", () => {
  it("keeps a numeric limit for check-in callers", () => {
    expect(buildActivityListQuery(100)).toBe("?limit=100");
  });

  it("omits empty look-up fields", () => {
    expect(buildActivityListQuery({ q: "  ", type: undefined })).toBe("");
  });

  it("encodes name, type, and dates", () => {
    expect(
      buildActivityListQuery({
        q: "plants",
        type: "must",
        from: "2026-08-01",
        to: "2026-08-19",
      }),
    ).toBe("?q=plants&type=must&from=2026-08-01&to=2026-08-19");
  });
});
