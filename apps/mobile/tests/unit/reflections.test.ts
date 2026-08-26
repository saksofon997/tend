import { describe, expect, it } from "bun:test";
import type { ReflectionResponse } from "../../src/types";
import { buildReflectionsQuery, replaceReflectionEntry } from "../../src/utils/reflections";

function leaf(entryDate: string, body: string): ReflectionResponse {
  return {
    id: entryDate,
    entryDate,
    body,
    createdAt: "2026-08-26T10:00:00.000Z",
    updatedAt: "2026-08-26T10:00:00.000Z",
  };
}

describe("replaceReflectionEntry", () => {
  it("replaces a written leaf for the same day", () => {
    const next = replaceReflectionEntry(
      [leaf("2026-08-26", "first"), leaf("2026-08-20", "earlier")],
      leaf("2026-08-26", "rewritten"),
      "2026-08-26",
    );
    expect(next[0]?.body).toBe("rewritten");
    expect(next).toHaveLength(2);
  });

  it("removes a leaf when the day is cleared", () => {
    const next = replaceReflectionEntry([leaf("2026-08-26", "first")], null, "2026-08-26");
    expect(next).toEqual([]);
  });
});

describe("buildReflectionsQuery", () => {
  it("omits empty ranges", () => {
    expect(buildReflectionsQuery()).toBe("");
  });

  it("includes from and to", () => {
    expect(buildReflectionsQuery("2026-08-01", "2026-08-31")).toBe(
      "?from=2026-08-01&to=2026-08-31",
    );
  });
});
