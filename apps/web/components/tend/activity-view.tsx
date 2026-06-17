"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityListItem } from "@/components/tend/activity-list-item";
import { EmptyStatePreset } from "@/components/tend/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ActivityEntryResponse } from "@/lib/activity/serialize";
import { groupActivityEntriesByWeek } from "@/lib/activity/week-groups";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ActivityViewProps {
  user: { displayName: string };
  initialEvents: ActivityEntryResponse[];
}

export function ActivityView({ user, initialEvents }: ActivityViewProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [error, setError] = useState<string | null>(null);
  const weekGroups = groupActivityEntriesByWeek(events);

  async function handleEventUpdate(eventId: string, tendedAt: string) {
    setError(null);

    const response = await fetch(`/api/v1/activity/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tendedAt }),
    });

    if (!response.ok) {
      throw new Error("Update failed");
    }

    const body = (await response.json()) as { event: { id: string; tendedAt: string } };
    setEvents((current) =>
      current
        .map((entry) =>
          entry.id === eventId ? { ...entry, tendedAt: body.event.tendedAt } : entry,
        )
        .sort((a, b) => new Date(b.tendedAt).getTime() - new Date(a.tendedAt).getTime()),
    );
    router.refresh();
  }

  async function handleEventDelete(eventId: string) {
    setError(null);

    const response = await fetch(`/api/v1/activity/${eventId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    setEvents((current) => current.filter((entry) => entry.id !== eventId));
    router.refresh();
  }

  return (
    <AppShell user={user} activePath="/activity">
      <PageHeader title="Recent activity" subtitle="What you've tended lately." />

      {error ? (
        <Alert variant="error" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {events.length === 0 ? (
        <EmptyStatePreset preset="no-activity" />
      ) : (
        <div className="flex flex-col gap-6">
          {weekGroups.map((group) => (
            <section key={group.key} aria-labelledby={`activity-week-${group.key}`}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2
                  id={`activity-week-${group.key}`}
                  className="font-medium text-foreground text-sm"
                >
                  {group.label}
                </h2>
                <span className="text-muted-foreground text-xs">
                  {group.entries.length} {group.entries.length === 1 ? "event" : "events"}
                </span>
              </div>

              <ul className="group flex flex-col gap-3">
                {group.entries.map((entry) => (
                  <ActivityListItem
                    key={entry.id}
                    entry={entry}
                    onUpdate={handleEventUpdate}
                    onDelete={handleEventDelete}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
