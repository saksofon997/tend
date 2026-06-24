import type { KeyboardAvoidingViewProps } from "react-native";

export function keyboardAvoidingBehavior(platform: string): KeyboardAvoidingViewProps["behavior"] {
  return platform === "ios" ? "padding" : "height";
}
