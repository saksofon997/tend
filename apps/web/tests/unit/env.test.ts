import { afterEach, describe, expect, it } from "bun:test";
import { restoreEnv, unsetEnv } from "../env";

const originalMarker = process.env.TEND_UNSET_ENV_MARKER;

afterEach(() => {
  restoreEnv("TEND_UNSET_ENV_MARKER", originalMarker);
});

describe("unsetEnv", () => {
  it("removes a process env key instead of storing the string undefined", () => {
    process.env.TEND_UNSET_ENV_MARKER = "set";
    unsetEnv("TEND_UNSET_ENV_MARKER");

    expect(process.env.TEND_UNSET_ENV_MARKER).toBeUndefined();
    expect("TEND_UNSET_ENV_MARKER" in process.env).toBe(false);
  });
});
