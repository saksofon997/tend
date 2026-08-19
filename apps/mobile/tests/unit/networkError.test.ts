import { describe, expect, it } from "bun:test";
import { ApiError } from "../../src/services/apiError";
import {
  getErrorMessage,
  isNetworkFailureMessage,
  toNetworkApiError,
} from "../../src/utils/networkError";

describe("networkError", () => {
  it("detects Android java.io network failures", () => {
    expect(
      isNetworkFailureMessage("java.io.IOException: Failed to connect to /192.168.1.64:3000"),
    ).toBe(true);
  });

  it("maps raw network failures to friendly API errors", () => {
    const error = toNetworkApiError(
      new Error("java.io.IOException: Failed to connect to /192.168.1.64:3000"),
      "http://192.168.0.194:3000",
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe(
      "Could not reach http://192.168.0.194:3000. Check the API URL and server.",
    );
  });

  it("returns fallback copy instead of raw platform errors", () => {
    expect(
      getErrorMessage(
        new Error("java.io.IOException: Failed to connect to /192.168.1.64:3000"),
        "Could not load items",
      ),
    ).toBe("Could not load items");
    expect(getErrorMessage(new TypeError("Failed to fetch"), "Could not load activity")).toBe(
      "Could not load activity",
    );
  });
});
