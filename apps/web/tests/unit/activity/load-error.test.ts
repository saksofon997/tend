import { describe, expect, it } from "bun:test";
import { activityLoadErrorMessage, isAbortError } from "@/lib/activity/load-error";

describe("activityLoadErrorMessage", () => {
  it("does not surface Failed to fetch when activity reload fails", () => {
    expect(
      activityLoadErrorMessage(new TypeError("Failed to fetch"), "Could not load activity."),
    ).toBe("Could not load activity.");
  });

  it("ignores aborted reloads so a filter reset does not show an error", () => {
    const abortError = new Error("The user aborted a request");
    abortError.name = "AbortError";
    expect(isAbortError(abortError)).toBe(true);
    expect(activityLoadErrorMessage(abortError, "Could not load activity.")).toBe("");
  });
});
