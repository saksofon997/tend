import type { ActivityEntryResponse } from "@/types";
import type { TendApi } from "@api/tendApi";
import { t } from "@i18n";
import type { ActivityListParams } from "@utils/activitySearch";
import { getErrorMessage } from "@utils/networkError";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useActivityEvents(api: TendApi, filters: ActivityListParams = {}) {
  const [events, setEvents] = useState<ActivityEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    setError(null);
    try {
      const body = await api.listActivity(filters);
      setEvents(body.events);
    } catch (loadError) {
      setError(getErrorMessage(loadError, t("errors.activity.load")));
    } finally {
      setLoading(false);
    }
  }, [api, filters]);

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

  const updateActivity = useCallback(
    async (eventId: string, tendedAt: string) => {
      const body = await api.updateActivity(eventId, tendedAt);
      const updatedEvent: ActivityEntryResponse = {
        id: body.event.id,
        itemId: body.event.itemId,
        itemName: body.item.name,
        itemType: body.item.type,
        tendedAt: body.event.tendedAt,
        createdAt: body.event.createdAt,
      };
      setEvents((current) => replaceActivityEvent(current, updatedEvent));
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
    updateActivity,
  };
}

export function replaceActivityEvent(
  events: ActivityEntryResponse[],
  updatedEvent: ActivityEntryResponse,
) {
  return events
    .map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    .sort((a, b) => new Date(b.tendedAt).getTime() - new Date(a.tendedAt).getTime());
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
