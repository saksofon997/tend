import { describe, expect, it } from "bun:test";
import { refreshHomeData } from "../../src/utils/homeRefresh";

describe("refreshHomeData", () => {
  it("loads items and reminders in parallel", async () => {
    const calls: string[] = [];

    await refreshHomeData(
      async (showRefreshing) => {
        calls.push(`items:${showRefreshing}`);
      },
      async (options) => {
        calls.push(`reminders:${options?.force}`);
      },
    );

    expect(calls).toContain("items:true");
    expect(calls).toContain("reminders:true");
    expect(calls).toHaveLength(2);
  });
});
