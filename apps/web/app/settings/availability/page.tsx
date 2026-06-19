import { AvailabilityEditor } from "@/components/forms/availability-editor";
import { AvailabilityPageHeader } from "@/components/forms/availability-page-header";
import { AppShell } from "@/components/layout/app-shell";
import { validateSession } from "@/lib/auth/session";
import { serializeAvailabilityWindow } from "@/lib/availability/serialize";
import { getDb } from "@/lib/db";
import { listAvailabilityWindowsForUser } from "@tend/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Availability · Tend",
};

export default async function AvailabilitySettingsPage() {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  const windows = await listAvailabilityWindowsForUser(getDb(), user.id);

  return (
    <AppShell user={{ displayName: user.displayName }} activePath="/settings/availability">
      <AvailabilityPageHeader />
      <AvailabilityEditor initialWindows={windows.map(serializeAvailabilityWindow)} />
    </AppShell>
  );
}
