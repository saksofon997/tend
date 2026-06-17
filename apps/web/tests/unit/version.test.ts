import { describe, expect, it } from "bun:test";
import { API_VERSION, APP_VERSION } from "@/lib/version";
import versions from "../../../../version.json";

describe("version", () => {
  it("reads app and api versions from version.json", () => {
    expect(APP_VERSION).toBe(versions.app);
    expect(API_VERSION).toBe(versions.api);
  });

  it("uses semver-shaped version strings", () => {
    const semverPattern = /^\d+\.\d+\.\d+$/;
    expect(APP_VERSION).toMatch(semverPattern);
    expect(API_VERSION).toMatch(semverPattern);
  });
});
