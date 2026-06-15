import { describe, expect, it } from "bun:test";
import { listActivityQuerySchema, updateEventSchema } from "@/lib/activity/validation";

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
});

describe("updateEventSchema", () => {
  it("accepts a valid ISO tendedAt", () => {
    const parsed = updateEventSchema.safeParse({
      tendedAt: "2026-06-10T12:00:00.000Z",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tendedAt).toBeInstanceOf(Date);
    }
  });

  it("rejects invalid tendedAt", () => {
    const parsed = updateEventSchema.safeParse({
      tendedAt: "not-a-date",
    });

    expect(parsed.success).toBe(false);
  });
});
