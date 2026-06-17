import { describe, expect, it } from "bun:test";
import { isDevMode } from "../../src/utils/devMode";

type GlobalWithDev = typeof globalThis & { __DEV__?: boolean };
const globalWithDev = globalThis as GlobalWithDev;

describe("devMode", () => {
  it("is true when __DEV__ is true", () => {
    const previous = globalWithDev.__DEV__;
    globalWithDev.__DEV__ = true;
    expect(isDevMode()).toBe(true);
    globalWithDev.__DEV__ = previous;
  });

  it("is false when __DEV__ is false or unset", () => {
    const previous = globalWithDev.__DEV__;
    globalWithDev.__DEV__ = false;
    expect(isDevMode()).toBe(false);
    globalWithDev.__DEV__ = undefined;
    expect(isDevMode()).toBe(false);
    globalWithDev.__DEV__ = previous;
  });
});
