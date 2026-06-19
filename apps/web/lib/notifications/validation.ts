import { z } from "zod";

const expoPushTokenPattern = /^(ExponentPushToken|ExpoPushToken)\[[\w-]+\]$/;

export const pushSubscriptionSchema = z.object({
  token: z.string().regex(expoPushTokenPattern, "Token must be an Expo push token"),
  platform: z.enum(["ios", "android"]),
});

export const deletePushSubscriptionSchema = z.object({
  token: z.string().regex(expoPushTokenPattern, "Token must be an Expo push token"),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request body";
}
