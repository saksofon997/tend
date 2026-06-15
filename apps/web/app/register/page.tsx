import { RegisterForm } from "@/components/forms/register-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { validateSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const { user } = await validateSession();
  if (user) {
    redirect("/");
  }

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
