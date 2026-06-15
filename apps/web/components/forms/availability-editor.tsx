"use client";

import { FormField } from "@/components/forms/form-field";
import { EmptyStatePreset } from "@/components/tend/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readApiError } from "@/lib/api-client";
import type { AvailabilityWindowResponse } from "@/lib/availability/serialize";
import type { AvailabilityWindow } from "@tend/domain";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const DAYS = [
  { dayOfWeek: 0, label: "Sunday" },
  { dayOfWeek: 1, label: "Monday" },
  { dayOfWeek: 2, label: "Tuesday" },
  { dayOfWeek: 3, label: "Wednesday" },
  { dayOfWeek: 4, label: "Thursday" },
  { dayOfWeek: 5, label: "Friday" },
  { dayOfWeek: 6, label: "Saturday" },
] as const;

interface EditableWindow {
  key: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AvailabilityEditorProps {
  initialWindows: AvailabilityWindowResponse[];
  onSaved?: (windows: AvailabilityWindowResponse[]) => void;
}

function toEditableWindows(windows: AvailabilityWindowResponse[]): EditableWindow[] {
  return windows.map((window) => ({
    key: window.id,
    dayOfWeek: window.dayOfWeek,
    startTime: window.startTime,
    endTime: window.endTime,
  }));
}

function normalizeTimeInput(value: string): string {
  const [hours, minutes] = value.split(":");
  return `${hours}:${minutes}`;
}

function createWindow(dayOfWeek: number): EditableWindow {
  return {
    key: `new-${dayOfWeek}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    dayOfWeek,
    startTime: "18:00",
    endTime: "20:00",
  };
}

export function AvailabilityEditor({ initialWindows, onSaved }: AvailabilityEditorProps) {
  const [windows, setWindows] = useState<EditableWindow[]>(() => toEditableWindows(initialWindows));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const windowsByDay = useMemo(() => {
    const grouped = new Map<number, EditableWindow[]>();

    for (let day = 0; day < 7; day += 1) {
      grouped.set(day, []);
    }

    for (const window of windows) {
      grouped.get(window.dayOfWeek)?.push(window);
    }

    return grouped;
  }, [windows]);

  function updateWindow(
    key: string,
    patch: Partial<Pick<EditableWindow, "startTime" | "endTime">>,
  ) {
    setWindows((current) =>
      current.map((window) => (window.key === key ? { ...window, ...patch } : window)),
    );
    setSuccess(false);
  }

  function addWindow(dayOfWeek: number) {
    setWindows((current) => [...current, createWindow(dayOfWeek)]);
    setSuccess(false);
  }

  function removeWindow(key: string) {
    setWindows((current) => current.filter((window) => window.key !== key));
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload: AvailabilityWindow[] = windows.map((window) => ({
      dayOfWeek: window.dayOfWeek,
      startTime: normalizeTimeInput(window.startTime),
      endTime: normalizeTimeInput(window.endTime),
    }));

    const response = await fetch("/api/v1/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ windows: payload }),
    });

    setSaving(false);

    if (!response.ok) {
      setError(await readApiError(response, "Could not save availability."));
      return;
    }

    const body = (await response.json()) as { windows: AvailabilityWindowResponse[] };
    setWindows(toEditableWindows(body.windows));
    setSuccess(true);
    onSaved?.(body.windows);
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {windows.length === 0 ? <EmptyStatePreset preset="no-availability" /> : null}

      <div className="flex flex-col gap-4">
        {DAYS.map(({ dayOfWeek, label }) => {
          const dayWindows = windowsByDay.get(dayOfWeek) ?? [];

          return (
            <div
              key={label}
              className="rounded-lg border border-border bg-card p-4 shadow-[var(--tend-shadow-sm)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium text-foreground">{label}</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addWindow(dayOfWeek)}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Add window
                </Button>
              </div>

              {dayWindows.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No windows set</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {dayWindows.map((window) => (
                    <li key={window.key} className="flex flex-wrap items-end gap-3">
                      <FormField id={`start-${window.key}`} label="Start" className="min-w-[8rem]">
                        <Input
                          id={`start-${window.key}`}
                          type="time"
                          value={window.startTime}
                          onChange={(event) =>
                            updateWindow(window.key, { startTime: event.target.value })
                          }
                        />
                      </FormField>

                      <FormField id={`end-${window.key}`} label="End" className="min-w-[8rem]">
                        <Input
                          id={`end-${window.key}`}
                          type="time"
                          value={window.endTime}
                          onChange={(event) =>
                            updateWindow(window.key, { endTime: event.target.value })
                          }
                        />
                      </FormField>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => removeWindow(window.key)}
                        aria-label={`Remove window on ${label}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save availability"}
        </Button>
        {success ? (
          <Alert variant="info" className="w-auto px-3 py-2">
            <AlertDescription>Availability saved.</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
