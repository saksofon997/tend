import { describe, expect, it } from "bun:test";
import { colors } from "@/theme";

describe("theme colors", () => {
  it("uses the same warm linen page background as the web app", () => {
    expect(colors.bg).toBe("#f7f5f2");
  });
});
