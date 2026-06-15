import { describe, expect, it } from "bun:test";
import { fieldErrorsFromZod, registerFormFieldErrors } from "@/lib/forms/client-validation";
import { z } from "zod";

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

describe("registerFormFieldErrors", () => {
  it("returns live password errors only when fields have values", () => {
    expect(
      registerFormFieldErrors(
        {
          displayName: "",
          email: "",
          password: "short",
          confirmPassword: "",
        },
        { liveOnly: true },
      ),
    ).toEqual({
      password: "Password must be at least 8 characters",
    });

    expect(
      registerFormFieldErrors(
        {
          displayName: "",
          email: "",
          password: "password123",
          confirmPassword: "different",
        },
        { liveOnly: true },
      ),
    ).toEqual({
      confirmPassword: "Passwords do not match",
    });
  });

  it("returns all field errors when liveOnly is false", () => {
    const errors = registerFormFieldErrors({
      displayName: "",
      email: "bad",
      password: "short",
      confirmPassword: "different",
    });

    expect(errors.displayName).toBe("Display name is required");
    expect(errors.email).toBeDefined();
    expect(errors.password).toBe("Password must be at least 8 characters");
    expect(errors.confirmPassword).toBe("Passwords do not match");
  });
});
