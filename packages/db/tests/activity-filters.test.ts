import { describe, expect, it } from "bun:test";
import {
  activityEventFilterConditions,
  escapeIlikePattern,
  hasActivityEventFilter,
} from "../src/activity-filters";

describe("escapeIlikePattern", () => {
  it("escapes LIKE wildcards so a name search is literal", () => {
    expect(escapeIlikePattern("100% cotton")).toBe("100\\% cotton");
    expect(escapeIlikePattern("plant_food")).toBe("plant\\_food");
    expect(escapeIlikePattern("path\\name")).toBe("path\\\\name");
  });
});

describe("hasActivityEventFilter", () => {
  it("is false when nothing is set", () => {
    expect(hasActivityEventFilter(undefined)).toBe(false);
    expect(hasActivityEventFilter({})).toBe(false);
    expect(hasActivityEventFilter({ query: "   " })).toBe(false);
  });

  it("is true for name, type, or date bounds", () => {
    expect(hasActivityEventFilter({ query: "plants" })).toBe(true);
    expect(hasActivityEventFilter({ type: "must" })).toBe(true);
    expect(hasActivityEventFilter({ from: new Date("2026-08-01T00:00:00.000Z") })).toBe(true);
    expect(hasActivityEventFilter({ to: new Date("2026-08-19T23:59:59.999Z") })).toBe(true);
  });
});

describe("activityEventFilterConditions", () => {
  it("returns no extra conditions without a filter", () => {
    expect(activityEventFilterConditions(undefined)).toEqual([]);
    expect(activityEventFilterConditions({})).toEqual([]);
  });

  it("adds a condition for each provided filter", () => {
    const conditions = activityEventFilterConditions({
      query: "plants",
      type: "want",
      from: new Date("2026-08-01T00:00:00.000Z"),
      to: new Date("2026-08-19T23:59:59.999Z"),
    });

    expect(conditions).toHaveLength(4);
  });
});
