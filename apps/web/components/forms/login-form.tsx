"use client";

import { AuthForm } from "@/components/forms/auth-form";
import { readApiError } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();

  async function handleSubmit(data: { email: string; password: string }) {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, t("errors.signIn")));
    }

    router.push("/");
    router.refresh();
  }

  return <AuthForm mode="login" onSubmit={handleSubmit} />;
}
