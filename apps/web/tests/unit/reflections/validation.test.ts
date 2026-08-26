import { describe, expect, it } from "bun:test";
import {
  calendarDateSchema,
  formatZodError,
  listReflectionsQuerySchema,
  upsertReflectionSchema,
} from "@/lib/reflections/validation";
import { REFLECTION_BODY_MAX_LENGTH } from "@tend/domain";

describe("reflection validation", () => {
  it("accepts a real calendar day", () => {
    expect(calendarDateSchema.parse("2026-08-26")).toBe("2026-08-26");
  });

  it("rejects impossible calendar days", () => {
    const parsed = calendarDateSchema.safeParse("2026-02-31");
    expect(parsed.success).toBe(false);
  });

  it("requires from to be on or before to", () => {
    const parsed = listReflectionsQuerySchema.safeParse({
      from: "2026-08-26",
      to: "2026-08-01",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(formatZodError(parsed.error)).toBe("from must be on or before to");
    }
  });

  it("rejects bodies longer than one leaf", () => {
    const parsed = upsertReflectionSchema.safeParse({
      body: "a".repeat(REFLECTION_BODY_MAX_LENGTH + 1),
    });
    expect(parsed.success).toBe(false);
  });

  it("allows a blank body so a leaf can be cleared", () => {
    expect(upsertReflectionSchema.parse({ body: "" })).toEqual({ body: "" });
  });
});
