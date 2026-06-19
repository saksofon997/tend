import { mock } from "bun:test";

/** Shared mutable mocks so modules cached by earlier test files stay controllable. */
export const platformState = {
  OS: "android" as string,
};

export const constantsState = {
  appOwnership: "standalone" as string | null,
};

export const deviceState = {
  isDevice: true,
};

export const storageCalls: Array<{ key: string; value?: string; action: "set" | "remove" }> = [];

mock.module("expo-constants", () => ({
  default: constantsState,
}));

mock.module("expo-device", () => ({
  isDevice: deviceState.isDevice,
  default: deviceState,
}));

mock.module("react-native", () => ({
  Platform: platformState,
}));

mock.module("@utils/storage", () => ({
  storage: {
    getString: async () => null,
    remove: async (key: string) => {
      storageCalls.push({ action: "remove", key });
    },
    setString: async (key: string, value: string) => {
      storageCalls.push({ action: "set", key, value });
    },
  },
}));
