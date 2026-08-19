import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { validateSession } from "@/lib/auth/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password · Tend",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { user } = await validateSession();
  if (user) {
    redirect("/");
  }

  const { token } = await searchParams;

  return (
    <AuthLayout>
      <ResetPasswordForm token={token?.trim() || null} />
    </AuthLayout>
  );
}
