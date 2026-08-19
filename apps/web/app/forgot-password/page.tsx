import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { validateSession } from "@/lib/auth/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot password · Tend",
};

export default async function ForgotPasswordPage() {
  const { user } = await validateSession();
  if (user) {
    redirect("/");
  }

  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
