import { describe, expect, it } from "bun:test";
import { lifeAreaEnum, tendItemTypeEnum, tendStatusEnum } from "./schema";

describe("schema enums", () => {
  it("defines tend item types", () => {
    expect(tendItemTypeEnum.enumValues).toEqual(["must", "want"]);
  });

  it("defines tend statuses", () => {
    expect(tendStatusEnum.enumValues).toEqual(["fresh", "getting_stale", "needs_attention"]);
  });

  it("defines life areas", () => {
    expect(lifeAreaEnum.enumValues).toEqual([
      "household",
      "health",
      "relationships",
      "pets",
      "vehicle",
      "admin",
      "personal",
    ]);
  });
});
