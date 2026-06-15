import { describe, expect, it } from "bun:test";
import { createItemSchema, updateItemSchema } from "@/lib/items/validation";

describe("createItemSchema", () => {
  it("accepts a valid item", () => {
    const result = createItemSchema.safeParse({
      name: "Water plants",
      type: "want",
      rhythmDays: 3,
      lifeArea: "household",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty names", () => {
    const result = createItemSchema.safeParse({
      name: "",
      type: "want",
      rhythmDays: 3,
    });

    expect(result.success).toBe(false);
  });
});

describe("updateItemSchema", () => {
  it("accepts archive toggles", () => {
    const result = updateItemSchema.safeParse({ archived: true });
    expect(result.success).toBe(true);
  });

  it("rejects empty updates", () => {
    const result = updateItemSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
