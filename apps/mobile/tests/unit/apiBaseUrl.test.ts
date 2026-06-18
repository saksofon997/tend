import { describe, expect, it } from "bun:test";
import {
  isDevApiUrl,
  resolveStoredApiBaseUrl,
  shouldRefreshDevApiBaseUrl,
} from "../../src/utils/apiBaseUrl";

describe("apiBaseUrl", () => {
  it("detects local development API URLs", () => {
    expect(isDevApiUrl("http://192.168.0.194:3000")).toBe(true);
    expect(isDevApiUrl("http://10.0.2.2:3000")).toBe(true);
    expect(isDevApiUrl("http://localhost:3000")).toBe(true);
    expect(isDevApiUrl("https://api.tend.app")).toBe(false);
    expect(isDevApiUrl("http://api.tend.app:3000")).toBe(false);
  });

  it("refreshes stale dev LAN URLs to the current Metro host", () => {
    expect(
      shouldRefreshDevApiBaseUrl("http://192.168.1.64:3000", "http://192.168.0.194:3000"),
    ).toBe(true);
    expect(resolveStoredApiBaseUrl("http://192.168.1.64:3000", "http://192.168.0.194:3000")).toBe(
      "http://192.168.0.194:3000",
    );
  });

  it("refreshes stale dev URLs to the production API in built apps", () => {
    expect(resolveStoredApiBaseUrl("http://10.0.2.2:3000", "https://app.tend.qzz.io")).toBe(
      "https://app.tend.qzz.io",
    );
    expect(resolveStoredApiBaseUrl("http://localhost:3000", "https://app.tend.qzz.io")).toBe(
      "https://app.tend.qzz.io",
    );
  });

  it("keeps custom production API URLs", () => {
    expect(shouldRefreshDevApiBaseUrl("https://api.tend.app", "http://192.168.0.194:3000")).toBe(
      false,
    );
    expect(resolveStoredApiBaseUrl("https://api.tend.app", "http://192.168.0.194:3000")).toBe(
      "https://api.tend.app",
    );
  });
});
