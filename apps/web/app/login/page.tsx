import { LoginForm } from "@/components/forms/login-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { validateSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

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
