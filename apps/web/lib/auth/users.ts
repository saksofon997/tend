import { hashPassword } from "@/lib/auth/password";
import type { RegisterInput } from "@/lib/auth/validation";
import { getDb } from "@/lib/db";
import { createUserRecord, findUserByEmail } from "@tend/db";

export async function findUserByEmailAddress(email: string) {
  return findUserByEmail(getDb(), email);
}

export async function createUser(input: RegisterInput) {
  const passwordHash = await hashPassword(input.password);

  return createUserRecord(getDb(), {
    displayName: input.displayName,
    email: input.email,
    passwordHash,
  });
}
