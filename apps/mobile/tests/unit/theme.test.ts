import { describe, expect, it } from "bun:test";
import { colors } from "@/theme";

describe("theme colors", () => {
  it("uses the same warm linen page background as the web app", () => {
    expect(colors.bg).toBe("#f7f5f2");
  });

  it("uses an opaque sun-ray gold matching the web scene token", () => {
    expect(colors.sunRay).toBe("rgb(255, 214, 140)");
  });
});
