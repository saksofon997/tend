import { describe, expect, it } from "bun:test";
import { serializeReflection } from "@/lib/reflections/serialize";

describe("serializeReflection", () => {
  it("keeps the calendar date as YYYY-MM-DD", () => {
    const createdAt = new Date("2026-08-26T10:00:00.000Z");
    const serialized = serializeReflection({
      id: "reflection-1",
      userId: "user-1",
      entryDate: "2026-08-26",
      body: "quiet morning",
      createdAt,
      updatedAt: createdAt,
    });

    expect(serialized).toEqual({
      id: "reflection-1",
      entryDate: "2026-08-26",
      body: "quiet morning",
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  });
});
