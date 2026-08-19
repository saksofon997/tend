"use client";

import { FormField } from "@/components/forms/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { readApiError } from "@/lib/api-client";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { fieldErrorsFromZod } from "@/lib/forms/client-validation";
import { useI18n } from "@/lib/i18n/client";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const { locale, t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const parsed = forgotPasswordSchema.safeParse({ email, locale });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, t("errors.forgotPassword")));
      }

      setSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("auth.error.fallback"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("auth.forgotPassword.title")}</CardTitle>
        <CardDescription>{t("auth.forgotPassword.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <Alert>
            <AlertDescription>{t("auth.forgotPassword.sent")}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField id="email" label={t("auth.email.label")} required error={fieldErrors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(changeEvent) => setEmail(changeEvent.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                required
              />
            </FormField>

            {error ? (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t("auth.forgotPassword.loading") : t("auth.forgotPassword.button")}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            {t("auth.forgotPassword.backToSignIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
