import { describe, expect, it } from "bun:test";
import { resetTendSchema } from "@/lib/settings/validation";

describe("resetTendSchema", () => {
  it("accepts an explicit confirmation", () => {
    expect(resetTendSchema.safeParse({ confirm: true }).success).toBe(true);
  });

  it("rejects a reset that is not confirmed", () => {
    expect(resetTendSchema.safeParse({ confirm: false }).success).toBe(false);
    expect(resetTendSchema.safeParse({}).success).toBe(false);
  });
});
