import { describe, expect, it } from "bun:test";
import { checkInQuerySchema, parseCheckInPeriod } from "@/lib/check-in/validation";

describe("check-in query", () => {
  it("defaults to the past week", () => {
    expect(parseCheckInPeriod(undefined)).toBe("week");
    expect(checkInQuerySchema.parse({}).period).toBe("week");
  });

  it("accepts the supported quiet periods", () => {
    expect(parseCheckInPeriod("month")).toBe("month");
    expect(parseCheckInPeriod("ninety")).toBe("ninety");
    expect(parseCheckInPeriod("all")).toBe("all");
  });

  it("falls back when the period is unknown", () => {
    expect(parseCheckInPeriod("year")).toBe("week");
    expect(checkInQuerySchema.safeParse({ period: "year" }).success).toBe(false);
  });
});
