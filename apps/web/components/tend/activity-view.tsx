"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityFilters } from "@/components/tend/activity-filters";
import { ActivityListItem } from "@/components/tend/activity-list-item";
import { EmptyStatePreset } from "@/components/tend/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { activityLoadErrorMessage, isAbortError } from "@/lib/activity/load-error";
import {
  type ActivitySearchFilters,
  EMPTY_ACTIVITY_SEARCH_FILTERS,
  activitySearchQueryString,
  canRequestActivitySearch,
  hasActivitySearchFilters,
} from "@/lib/activity/search-filters";
import type { ActivityEntryResponse } from "@/lib/activity/serialize";
import { groupActivityEntriesByWeek } from "@/lib/activity/week-groups";
import { useI18n } from "@/lib/i18n/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ActivityViewProps {
  user: { displayName: string };
  initialEvents: ActivityEntryResponse[];
}

export function ActivityView({ user, initialEvents }: ActivityViewProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [filters, setFilters] = useState<ActivitySearchFilters>(EMPTY_ACTIVITY_SEARCH_FILTERS);
  const [events, setEvents] = useState(initialEvents);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const skipInitialFetch = useRef(true);
  const weekGroups = groupActivityEntriesByWeek(events, new Date(), locale);
  const filtersActive = hasActivitySearchFilters(filters);

  useEffect(() => {
    if (skipInitialFetch.current && !hasActivitySearchFilters(filters)) {
      skipInitialFetch.current = false;
      return;
    }

    if (!canRequestActivitySearch(filters)) {
      return;
    }

    if (!hasActivitySearchFilters(filters)) {
      setEvents(initialEvents);
      setError(null);
    }

    const controller = new AbortController();
    const delay = filters.q.trim() ? 250 : 0;
    const fallback = t("errors.activity.load");
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/activity${activitySearchQueryString(filters)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(fallback);
        }

        const body = (await response.json()) as { events: ActivityEntryResponse[] };
        setEvents(body.events);
      } catch (loadError) {
        if (isAbortError(loadError)) {
          return;
        }

        setError(activityLoadErrorMessage(loadError, fallback));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, delay);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [filters, initialEvents, t]);

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
      <PageHeader title={t("activity.title")} subtitle={t("activity.subtitle")} />

      <ActivityFilters value={filters} onChange={setFilters} />

      {error ? (
        <Alert variant="error" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {events.length === 0 ? (
        <EmptyStatePreset preset={filtersActive ? "no-activity-matches" : "no-activity"} />
      ) : (
        <div className={loading ? "pointer-events-none opacity-70" : undefined} aria-busy={loading}>
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
                    {group.entries.length === 1
                      ? t("activity.eventCountOne")
                      : t("activity.eventCount", { count: group.entries.length })}
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
        </div>
      )}
    </AppShell>
  );
}
