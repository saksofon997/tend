import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { fieldErrorsFromZod } from "./client-validation";

describe("fieldErrorsFromZod", () => {
  it("maps the first issue per field path", () => {
    const schema = z.object({
      email: z.string().email("Enter a valid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    });

    const result = schema.safeParse({ email: "bad", password: "short" });
    if (result.success) {
      throw new Error("Expected validation failure");
    }

    expect(fieldErrorsFromZod(result.error)).toEqual({
      email: "Enter a valid email address",
      password: "Password must be at least 8 characters",
    });
  });
});
