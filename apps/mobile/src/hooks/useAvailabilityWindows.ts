import type { AvailabilityWindowResponse } from "@/types";
import type { TendApi } from "@api/tendApi";
import { t } from "@i18n";
import type { AvailabilityWindow } from "@tend/domain";
import { getErrorMessage } from "@utils/networkError";
import { normalizeTimeValue } from "@utils/timeOptions";
import { useCallback, useEffect, useMemo, useState } from "react";

export type EditableWindow = {
  key: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export function useAvailabilityWindows(api: TendApi) {
  const [windows, setWindows] = useState<EditableWindow[]>([]);
  const [savedWindows, setSavedWindows] = useState<EditableWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadAvailability = useCallback(async () => {
    setError(null);
    try {
      const body = await api.listAvailability();
      const editable = body.windows.map(toEditableWindow);
      setWindows(editable);
      setSavedWindows(editable);
    } catch (loadError) {
      setError(getErrorMessage(loadError, t("errors.availability.load")));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    let mounted = true;

    async function loadInitialAvailability() {
      await loadAvailability();
      if (!mounted) {
        return;
      }
    }

    loadInitialAvailability();
    return () => {
      mounted = false;
    };
  }, [loadAvailability]);

  const addWindow = useCallback((dayOfWeek: number) => {
    setSuccess(false);
    setWindows((current) => [
      ...current,
      {
        key: `new-${dayOfWeek}-${Date.now()}`,
        dayOfWeek,
        startTime: "18:00",
        endTime: "20:00",
      },
    ]);
  }, []);

  const updateWindow = useCallback((key: string, patch: Partial<EditableWindow>) => {
    setSuccess(false);
    setWindows((current) =>
      current.map((window) => (window.key === key ? { ...window, ...patch } : window)),
    );
  }, []);

  const removeWindow = useCallback((key: string) => {
    setSuccess(false);
    setWindows((current) => current.filter((window) => window.key !== key));
  }, []);

  const saveWindows = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload: AvailabilityWindow[] = windows.map(({ dayOfWeek, startTime, endTime }) => ({
      dayOfWeek,
      startTime: normalizeTimeValue(startTime),
      endTime: normalizeTimeValue(endTime),
    }));

    try {
      const body = await api.saveAvailability(payload);
      const editable = body.windows.map(toEditableWindow);
      setWindows(editable);
      setSavedWindows(editable);
      setSuccess(true);
    } catch (saveError) {
      setError(getErrorMessage(saveError, t("errors.availability.save")));
    } finally {
      setSaving(false);
    }
  }, [api, windows]);

  const hasChanges = JSON.stringify(windows) !== JSON.stringify(savedWindows);
  const byDay = useMemo(() => groupWindowsByDay(windows), [windows]);

  return {
    addWindow,
    byDay,
    error,
    hasChanges,
    loading,
    removeWindow,
    saveWindows,
    saving,
    success,
    updateWindow,
  };
}

function toEditableWindow(window: AvailabilityWindowResponse): EditableWindow {
  return {
    key: window.id,
    dayOfWeek: window.dayOfWeek,
    startTime: window.startTime,
    endTime: window.endTime,
  };
}

function groupWindowsByDay(windows: EditableWindow[]) {
  const grouped = new Map<number, EditableWindow[]>();

  for (let day = 0; day < 7; day += 1) {
    grouped.set(day, []);
  }

  for (const window of windows) {
    grouped.get(window.dayOfWeek)?.push(window);
  }

  return grouped;
}
