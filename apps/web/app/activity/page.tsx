import { ActivityView } from "@/components/tend/activity-view";
import { serializeActivityEntry } from "@/lib/activity/serialize";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { listRecentEventsForUser } from "@tend/db";
import { redirect } from "next/navigation";

export default async function ActivityPage() {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  const rows = await listRecentEventsForUser(getDb(), user.id);
  const initialEvents = rows.map(serializeActivityEntry);

  return <ActivityView user={{ displayName: user.displayName }} initialEvents={initialEvents} />;
}
