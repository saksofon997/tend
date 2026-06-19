import type { ActivityEntryResponse } from "@/types";
import type { TendApi } from "@api/tendApi";
import { t } from "@i18n";
import { getErrorMessage } from "@utils/networkError";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useActivityEvents(api: TendApi) {
  const [events, setEvents] = useState<ActivityEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    setError(null);
    try {
      const body = await api.listActivity();
      setEvents(body.events);
    } catch (loadError) {
      setError(getErrorMessage(loadError, t("errors.activity.load")));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    let mounted = true;

    async function loadInitialActivity() {
      await loadActivity();
      if (!mounted) {
        return;
      }
    }

    loadInitialActivity();
    return () => {
      mounted = false;
    };
  }, [loadActivity]);

  const deleteActivity = useCallback(
    async (eventId: string) => {
      await api.deleteActivity(eventId);
      setEvents((current) => current.filter((event) => event.id !== eventId));
    },
    [api],
  );

  const groups = useMemo(() => groupEventsByWeek(events), [events]);

  return {
    deleteActivity,
    error,
    events,
    groups,
    loadActivity,
    loading,
  };
}

function groupEventsByWeek(events: ActivityEntryResponse[]) {
  const groups = new Map<string, ActivityEntryResponse[]>();

  for (const event of events) {
    const date = new Date(event.tendedAt);
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const label = weekLabel(start);
    groups.set(label, [...(groups.get(label) ?? []), event]);
  }

  return Array.from(groups.entries()).map(([label, groupEvents]) => ({
    label,
    events: groupEvents,
  }));
}

function weekLabel(start: Date) {
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());

  if (start.toDateString() === currentWeekStart.toDateString()) {
    return t("activity.group.thisWeek");
  }

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);

  if (start.toDateString() === previousWeekStart.toDateString()) {
    return t("activity.group.lastWeek");
  }

  return t("activity.group.weekOf", { date: formatEventDate(start.toISOString()) });
}

function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
