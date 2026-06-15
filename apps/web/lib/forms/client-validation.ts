import { registerFormSchema } from "@/lib/auth/validation";
import type { z } from "zod";

export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}

export function registerFormFieldErrors(
  data: {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
  },
  options: { liveOnly?: boolean } = {},
): Record<string, string> {
  const parsed = registerFormSchema.safeParse(data);
  if (parsed.success) {
    return {};
  }

  const allErrors = fieldErrorsFromZod(parsed.error);
  if (!options.liveOnly) {
    return allErrors;
  }

  const liveErrors: Record<string, string> = {};
  if (data.password.length > 0 && allErrors.password) {
    liveErrors.password = allErrors.password;
  }
  if (data.confirmPassword.length > 0 && allErrors.confirmPassword) {
    liveErrors.confirmPassword = allErrors.confirmPassword;
  }

  return liveErrors;
}
