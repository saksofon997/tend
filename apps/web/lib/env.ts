import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
  ALLOWED_EMAILS: z.string().optional(),
  CANONICAL_APP_HOST: z.string().optional(),
  MARKETING_HOST: z.string().optional(),
});

export const env = envSchema.parse(process.env);
