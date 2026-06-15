import { describe, expect, it } from "bun:test";
import { readApiError } from "@/lib/api-client";

describe("readApiError", () => {
  it("returns error field from JSON body", async () => {
    const response = new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

    expect(await readApiError(response)).toBe("Invalid email");
  });

  it("returns fallback when body is empty JSON", async () => {
    const response = new Response("", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

    expect(await readApiError(response, "Server error")).toBe("Server error");
  });

  it("returns fallback when content-type is not JSON", async () => {
    const response = new Response("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    expect(await readApiError(response, "Something went wrong")).toBe("Something went wrong");
  });
});
