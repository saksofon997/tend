import { describe, expect, it } from "bun:test";
import { activityFilterBounds, listActivityQuerySchema } from "@/lib/activity/validation";

describe("listActivityQuerySchema", () => {
  it("defaults limit to 50", () => {
    const parsed = listActivityQuerySchema.safeParse({});
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.limit).toBe(50);
    }
  });

  it("rejects limits above 100", () => {
    const parsed = listActivityQuerySchema.safeParse({ limit: 200 });
    expect(parsed.success).toBe(false);
  });

  it("accepts a name, type, and date range", () => {
    const parsed = listActivityQuerySchema.safeParse({
      q: "  Plants  ",
      type: "must",
      from: "2026-08-01",
      to: "2026-08-19",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.q).toBe("Plants");
      expect(parsed.data.type).toBe("must");
      expect(parsed.data.from).toBe("2026-08-01");
      expect(parsed.data.to).toBe("2026-08-19");
    }
  });

  it("treats empty filter strings as unset", () => {
    const parsed = listActivityQuerySchema.safeParse({
      q: "   ",
      type: "",
      from: "",
      to: "",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.q).toBeUndefined();
      expect(parsed.data.type).toBeUndefined();
      expect(parsed.data.from).toBeUndefined();
      expect(parsed.data.to).toBeUndefined();
    }
  });

  it("rejects an inverted date range", () => {
    const parsed = listActivityQuerySchema.safeParse({
      from: "2026-08-19",
      to: "2026-08-01",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid type", () => {
    const parsed = listActivityQuerySchema.safeParse({ type: "fresh" });
    expect(parsed.success).toBe(false);
  });
});

describe("activityFilterBounds", () => {
  it("covers the UTC calendar day for from and to", () => {
    expect(activityFilterBounds("2026-08-01", "2026-08-19")).toEqual({
      from: new Date("2026-08-01T00:00:00.000Z"),
      to: new Date("2026-08-19T23:59:59.999Z"),
    });
  });
});
