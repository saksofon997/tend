import { AddItemForm } from "@/components/forms/add-item-form";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getUserSettings, isOnboardingComplete } from "@tend/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add item · Tend",
};

export default async function NewItemPage() {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings(getDb(), user.id);
  if (!isOnboardingComplete(settings)) {
    redirect("/onboarding");
  }

  return <AddItemForm user={{ displayName: user.displayName }} />;
}
