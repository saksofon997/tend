import { describe, expect, it } from "bun:test";
import { replaceAvailabilitySchema } from "@/lib/availability/validation";

describe("replaceAvailabilitySchema", () => {
  it("accepts valid windows", () => {
    const parsed = replaceAvailabilitySchema.safeParse({
      windows: [{ dayOfWeek: 1, startTime: "18:00", endTime: "22:00" }],
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects end time before start time", () => {
    const parsed = replaceAvailabilitySchema.safeParse({
      windows: [{ dayOfWeek: 1, startTime: "22:00", endTime: "18:00" }],
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts empty windows", () => {
    const parsed = replaceAvailabilitySchema.safeParse({ windows: [] });
    expect(parsed.success).toBe(true);
  });
});
