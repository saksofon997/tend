import { AvailabilityEditor } from "@/components/forms/availability-editor";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
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
      <PageHeader
        title="Availability"
        subtitle="Set when you are usually free to tend things. Notifications wait for these windows; musts still get priority over wants."
      />
      <AvailabilityEditor initialWindows={windows.map(serializeAvailabilityWindow)} />
    </AppShell>
  );
}
