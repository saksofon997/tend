import { describe, expect, it } from "bun:test";
import {
  EMPTY_ACTIVITY_SEARCH_FILTERS,
  activitySearchQueryString,
  hasActivitySearchFilters,
} from "@/lib/activity/search-filters";

describe("hasActivitySearchFilters", () => {
  it("is false for empty filters", () => {
    expect(hasActivitySearchFilters(EMPTY_ACTIVITY_SEARCH_FILTERS)).toBe(false);
    expect(hasActivitySearchFilters({ ...EMPTY_ACTIVITY_SEARCH_FILTERS, q: "  " })).toBe(false);
  });

  it("is true when a name, type, or date is set", () => {
    expect(hasActivitySearchFilters({ ...EMPTY_ACTIVITY_SEARCH_FILTERS, q: "plants" })).toBe(true);
    expect(hasActivitySearchFilters({ ...EMPTY_ACTIVITY_SEARCH_FILTERS, type: "want" })).toBe(true);
    expect(hasActivitySearchFilters({ ...EMPTY_ACTIVITY_SEARCH_FILTERS, from: "2026-08-01" })).toBe(
      true,
    );
  });
});

describe("activitySearchQueryString", () => {
  it("omits the default limit and empty filters", () => {
    expect(activitySearchQueryString(EMPTY_ACTIVITY_SEARCH_FILTERS)).toBe("");
  });

  it("includes set filters", () => {
    expect(
      activitySearchQueryString({
        q: " plants ",
        type: "must",
        from: "2026-08-01",
        to: "2026-08-19",
      }),
    ).toBe("?q=plants&type=must&from=2026-08-01&to=2026-08-19");
  });
});
