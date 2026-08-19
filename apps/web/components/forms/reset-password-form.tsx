"use client";

import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readApiError } from "@/lib/api-client";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { fieldErrorsFromZod } from "@/lib/forms/client-validation";
import { useI18n } from "@/lib/i18n/client";
import Link from "next/link";
import { useState } from "react";

interface ResetPasswordFormProps {
  token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [updated, setUpdated] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({
      token: token ?? "",
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: parsed.data.token,
          password: parsed.data.password,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, t("errors.resetPassword")));
      }

      setUpdated(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("auth.error.fallback"));
    } finally {
      setSubmitting(false);
    }
  }

  const missingToken = !token;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("auth.resetPassword.title")}</CardTitle>
        <CardDescription>{t("auth.resetPassword.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {updated ? (
          <Alert>
            <AlertDescription>{t("auth.resetPassword.success")}</AlertDescription>
          </Alert>
        ) : missingToken ? (
          <Alert variant="error">
            <AlertDescription>{t("auth.resetPassword.missingToken")}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              id="password"
              label={t("auth.password.label")}
              required
              error={fieldErrors.password}
              helper={t("auth.password.helper")}
            >
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(changeEvent) => setPassword(changeEvent.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                required
              />
            </FormField>

            <FormField
              id="confirmPassword"
              label={t("auth.passwordConfirm.label")}
              required
              error={fieldErrors.confirmPassword}
            >
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(changeEvent) => setConfirmPassword(changeEvent.target.value)}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                required
              />
            </FormField>

            {error ? (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t("auth.resetPassword.loading") : t("auth.resetPassword.button")}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            {t("auth.signIn.inlineLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
