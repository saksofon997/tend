import { describe, expect, it } from "bun:test";
import { hashPassword, verifyPassword } from "./password";
import { formatZodError, loginSchema, registerSchema } from "./validation";

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

describe("loginSchema", () => {
  it("requires email and password", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
  });
});
