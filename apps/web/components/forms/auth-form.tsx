"use client";

import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema, registerFormSchema } from "@/lib/auth/validation";
import { fieldErrorsFromZod, registerFormFieldErrors } from "@/lib/forms/client-validation";
import Link from "next/link";
import { useState } from "react";

export interface AuthFormData {
  displayName?: string;
  email: string;
  password: string;
}

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: AuthFormData) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function applyLiveRegisterErrors(nextPassword: string, nextConfirmPassword: string) {
    setFieldErrors((previous) => {
      const validationErrors = registerFormFieldErrors(
        {
          displayName,
          email,
          password: nextPassword,
          confirmPassword: nextConfirmPassword,
        },
        { liveOnly: true },
      );
      const { password: _password, confirmPassword: _confirmPassword, ...rest } = previous;
      return { ...rest, ...validationErrors };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (mode === "register") {
      const parsed = registerFormSchema.safeParse({
        displayName,
        email,
        password,
        confirmPassword,
      });
      if (!parsed.success) {
        setFieldErrors(fieldErrorsFromZod(parsed.error));
        setSubmitting(false);
        return;
      }

      try {
        await onSubmit({
          displayName: parsed.data.displayName,
          email: parsed.data.email,
          password: parsed.data.password,
        });
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Something went wrong");
        setSubmitting(false);
      }
      return;
    }

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(parsed.data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isRegister ? "Create your account" : "Sign in"}</CardTitle>
        <CardDescription>
          {isRegister
            ? "What should we call you? We'll greet you by this name on the home screen."
            : "Welcome back. See what could use a little attention today."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister ? (
            <FormField
              id="displayName"
              label="Display name"
              required
              error={fieldErrors.displayName}
            >
              <Input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                aria-invalid={Boolean(fieldErrors.displayName)}
                aria-describedby={fieldErrors.displayName ? "displayName-error" : undefined}
                required
              />
            </FormField>
          ) : null}

          <FormField id="email" label="Email" required error={fieldErrors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              required
            />
          </FormField>

          <FormField
            id="password"
            label="Password"
            required
            error={fieldErrors.password}
            helper={isRegister ? "At least 8 characters" : undefined}
          >
            <PasswordInput
              id="password"
              name="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : undefined}
              value={password}
              onChange={(event) => {
                const nextPassword = event.target.value;
                setPassword(nextPassword);
                if (isRegister) {
                  applyLiveRegisterErrors(nextPassword, confirmPassword);
                }
              }}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              required
            />
          </FormField>

          {isRegister ? (
            <FormField
              id="confirmPassword"
              label="Confirm password"
              required
              error={fieldErrors.confirmPassword}
            >
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  const nextConfirmPassword = event.target.value;
                  setConfirmPassword(nextConfirmPassword);
                  applyLiveRegisterErrors(password, nextConfirmPassword);
                }}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                required
              />
            </FormField>
          ) : null}

          {error ? (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? isRegister
                ? "Creating account…"
                : "Signing in…"
              : isRegister
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
