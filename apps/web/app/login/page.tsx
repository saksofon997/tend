import { LoginForm } from "@/components/forms/login-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { validateSession } from "@/lib/auth/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in · Tend",
};

export default async function LoginPage() {
  const { user } = await validateSession();
  if (user) {
    redirect("/");
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
