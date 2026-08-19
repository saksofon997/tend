import { eq } from "drizzle-orm";
import type { Database } from "./client";
import { passwordResetTokens } from "./schema";

export type PasswordResetTokenRow = typeof passwordResetTokens.$inferSelect;

export async function replacePasswordResetToken(
  database: Database,
  input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  },
): Promise<PasswordResetTokenRow> {
  await database.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, input.userId));

  const [token] = await database
    .insert(passwordResetTokens)
    .values({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    })
    .returning();

  if (!token) {
    throw new Error("Failed to create password reset token");
  }

  return token;
}

export async function findPasswordResetTokenByHash(
  database: Database,
  tokenHash: string,
): Promise<PasswordResetTokenRow | null> {
  const [token] = await database
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  return token ?? null;
}

export async function deletePasswordResetTokensForUser(
  database: Database,
  userId: string,
): Promise<void> {
  await database.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
}
