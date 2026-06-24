import { describe, expect, it } from "bun:test";
import { keyboardAvoidingBehavior } from "../../src/utils/keyboardAvoidance";

describe("keyboardAvoidingBehavior", () => {
  it("uses padding on iOS so focused inputs can move above the keyboard", () => {
    expect(keyboardAvoidingBehavior("ios")).toBe("padding");
  });

  it("uses height on Android so scroll containers resize around the keyboard", () => {
    expect(keyboardAvoidingBehavior("android")).toBe("height");
  });
});
