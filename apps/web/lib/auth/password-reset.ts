import { lucia } from "@/lib/auth/lucia";
import { hashPassword } from "@/lib/auth/password";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  isPasswordResetExpired,
  passwordResetExpiry,
} from "@/lib/auth/password-reset-token";
import { absoluteAppUrl } from "@/lib/canonical-host";
import { getDb } from "@/lib/db";
import { buildPasswordResetEmail } from "@/lib/email/password-reset";
import { type EmailMessage, sendEmail } from "@/lib/email/send";
import type { Locale } from "@/lib/i18n/dictionaries";
import {
  deletePasswordResetTokensForUser,
  findPasswordResetTokenByHash,
  findUserByEmail,
  replacePasswordResetToken,
  updateUserPasswordHash,
} from "@tend/db";

export async function requestPasswordReset(input: {
  email: string;
  locale?: Locale;
  now?: Date;
  deliverEmail?: (message: EmailMessage) => Promise<unknown>;
}): Promise<{ ok: true }> {
  const now = input.now ?? new Date();
  const user = await findUserByEmail(getDb(), input.email);
  if (!user) {
    return { ok: true };
  }

  const token = generatePasswordResetToken();
  await replacePasswordResetToken(getDb(), {
    userId: user.id,
    tokenHash: hashPasswordResetToken(token),
    expiresAt: passwordResetExpiry(now),
  });

  const resetUrl = absoluteAppUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  const message = buildPasswordResetEmail({
    to: user.email,
    resetUrl,
    locale: input.locale,
  });

  try {
    await (input.deliverEmail ?? sendEmail)(message);
  } catch (error) {
    console.error("Password reset email failed:", error);
  }

  return { ok: true };
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
  now?: Date;
}): Promise<{ ok: true } | { error: "invalid" }> {
  const now = input.now ?? new Date();
  const tokenHash = hashPasswordResetToken(input.token.trim());
  const stored = await findPasswordResetTokenByHash(getDb(), tokenHash);

  if (!stored || isPasswordResetExpired(stored.expiresAt, now)) {
    return { error: "invalid" };
  }

  const passwordHash = await hashPassword(input.password);
  await updateUserPasswordHash(getDb(), stored.userId, passwordHash);
  await deletePasswordResetTokensForUser(getDb(), stored.userId);
  await lucia.invalidateUserSessions(stored.userId);

  return { ok: true };
}
