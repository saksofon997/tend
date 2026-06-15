"use client";

import { AuthForm } from "@/components/forms/auth-form";
import { readApiError } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();

  async function handleSubmit(data: {
    displayName?: string;
    email: string;
    password: string;
  }) {
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, "Unable to create account"));
    }

    router.push("/onboarding");
    router.refresh();
  }

  return <AuthForm mode="register" onSubmit={handleSubmit} />;
}
