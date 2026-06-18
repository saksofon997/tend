import { mock } from "bun:test";

/** Shared mutable mocks so modules cached by earlier test files stay controllable. */
export const platformState = {
  OS: "android" as string,
};

export const constantsState = {
  appOwnership: "standalone" as string | null,
};

mock.module("expo-constants", () => ({
  default: constantsState,
}));

mock.module("react-native", () => ({
  Platform: platformState,
}));
