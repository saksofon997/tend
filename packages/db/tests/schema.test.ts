import { describe, expect, it } from "bun:test";
import {
  lifeAreaEnum,
  passwordResetTokens,
  pushSubscriptions,
  tendItemTypeEnum,
  tendItems,
  tendStatusEnum,
} from "../src/schema";

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

  it("defines push subscription notification history columns", () => {
    expect(pushSubscriptions.token.name).toBe("token");
    expect(pushSubscriptions.lastNotifiedItemId.name).toBe("last_notified_item_id");
    expect(pushSubscriptions.lastNotifiedAt.name).toBe("last_notified_at");
  });

  it("defines optional friend sharing on tend items", () => {
    expect(tendItems.sharedWithUserId.name).toBe("shared_with_user_id");
  });

  it("defines password reset tokens", () => {
    expect(passwordResetTokens.tokenHash.name).toBe("token_hash");
    expect(passwordResetTokens.expiresAt.name).toBe("expires_at");
    expect(passwordResetTokens.userId.name).toBe("user_id");
  });
});
