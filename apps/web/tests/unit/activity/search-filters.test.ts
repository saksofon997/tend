import { describe, expect, it } from "bun:test";
import {
  EMPTY_ACTIVITY_SEARCH_FILTERS,
  activitySearchQueryString,
  canRequestActivitySearch,
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

  it("treats locale-typed dates as unset", () => {
    expect(
      hasActivitySearchFilters({ ...EMPTY_ACTIVITY_SEARCH_FILTERS, from: "21. 02. yyyy" }),
    ).toBe(false);
  });
});

describe("canRequestActivitySearch", () => {
  it("allows empty filters so a reset can reload the list", () => {
    expect(canRequestActivitySearch(EMPTY_ACTIVITY_SEARCH_FILTERS)).toBe(true);
  });

  it("does not request with a locale-typed or inverted date", () => {
    expect(
      canRequestActivitySearch({ ...EMPTY_ACTIVITY_SEARCH_FILTERS, from: "21. 02. yyyy" }),
    ).toBe(false);
    expect(
      canRequestActivitySearch({
        ...EMPTY_ACTIVITY_SEARCH_FILTERS,
        from: "2026-08-19",
        to: "2026-08-01",
      }),
    ).toBe(false);
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

  it("omits locale-typed dates so a reset does not send a broken from/to", () => {
    expect(
      activitySearchQueryString({
        ...EMPTY_ACTIVITY_SEARCH_FILTERS,
        from: "21. 02. yyyy",
        to: "dd. mm. yyyy",
      }),
    ).toBe("");
  });
});
