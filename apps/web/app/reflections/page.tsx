import { ReflectionsView } from "@/components/tend/reflections-view";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { serializeReflection } from "@/lib/reflections/serialize";
import { listReflectionsForUser } from "@tend/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reflections · Tend",
};

export default async function ReflectionsPage() {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  const rows = await listReflectionsForUser(getDb(), user.id);
  const initialEntries = rows.map(serializeReflection);

  return (
    <ReflectionsView user={{ displayName: user.displayName }} initialEntries={initialEntries} />
  );
}
