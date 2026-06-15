import { describe, expect, it } from "bun:test";
import { lifeAreaEnum, tendItemTypeEnum, tendStatusEnum } from "../src/schema";

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
      "life_admin",
      "self_care",
      "finance",
      "food_kitchen",
      "home_maintenance",
      "outdoor",
      "kids_family",
      "personal",
    ]);
  });
});
