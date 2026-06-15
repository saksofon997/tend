import { describe, expect, it } from "bun:test";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  formatZodError,
  loginSchema,
  registerFormSchema,
  registerSchema,
} from "@/lib/auth/validation";

describe("password", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration input", () => {
    const result = registerSchema.safeParse({
      displayName: "Saki",
      email: "Saki@Example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("saki@example.com");
    }
  });

  it("rejects missing display name", () => {
    const result = registerSchema.safeParse({
      displayName: "",
      email: "saki@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result.error)).toBe("Display name is required");
    }
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      displayName: "Saki",
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = registerSchema.safeParse({
      displayName: "Saki",
      email: "saki@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});

describe("registerFormSchema", () => {
  it("requires confirm password", () => {
    const result = registerFormSchema.safeParse({
      displayName: "Saki",
      email: "saki@example.com",
      password: "password123",
      confirmPassword: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result.error)).toBe("Confirm your password");
    }
  });

  it("rejects mismatched passwords", () => {
    const result = registerFormSchema.safeParse({
      displayName: "Saki",
      email: "saki@example.com",
      password: "password123",
      confirmPassword: "different123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result.error)).toBe("Passwords do not match");
    }
  });

  it("accepts matching passwords", () => {
    const result = registerFormSchema.safeParse({
      displayName: "Saki",
      email: "saki@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("requires email and password", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
  });
});
