import { z } from "zod";

const expoPushTokenPattern = /^(ExponentPushToken|ExpoPushToken)\[[\w-]+\]$/;
const pushTokenSchema = z
  .string()
  .min(10, "Token must be at least 10 characters")
  .max(4096, "Token must be at most 4096 characters")
  .refine((token) => !/\s/u.test(token), "Token must not contain whitespace");

export const pushSubscriptionSchema = z.object({
  token: pushTokenSchema.refine(
    (token) => !expoPushTokenPattern.test(token),
    "Token must be a native FCM device token, not an Expo push token",
  ),
  platform: z.enum(["ios", "android"]),
});

export const deletePushSubscriptionSchema = z.object({
  token: pushTokenSchema,
});

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request body";
}
