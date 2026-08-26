import { ActivityView } from "@/components/tend/activity-view";
import { serializeActivityEntry } from "@/lib/activity/serialize";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { listRecentEventsForUser } from "@tend/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "History · Tend",
};

export default async function HistoryPage() {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  const rows = await listRecentEventsForUser(getDb(), user.id);
  const initialEvents = rows.map(serializeActivityEntry);

  return <ActivityView user={{ displayName: user.displayName }} initialEvents={initialEvents} />;
}
