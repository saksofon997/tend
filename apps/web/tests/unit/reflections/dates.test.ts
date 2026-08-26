import { describe, expect, it } from "bun:test";
import { entriesByDate, reflectionDayKind } from "@/lib/reflections/dates";

describe("reflectionDayKind", () => {
  it("labels today and yesterday without a due date", () => {
    expect(reflectionDayKind("2026-08-26", "2026-08-26")).toBe("today");
    expect(reflectionDayKind("2026-08-25", "2026-08-26")).toBe("yesterday");
    expect(reflectionDayKind("2026-08-01", "2026-08-26")).toBe("other");
  });
});

describe("entriesByDate", () => {
  it("indexes leaves by calendar day", () => {
    const map = entriesByDate([
      { entryDate: "2026-08-26", body: "today" },
      { entryDate: "2026-08-20", body: "earlier" },
    ]);
    expect(map.get("2026-08-26")?.body).toBe("today");
    expect(map.size).toBe(2);
  });
});
