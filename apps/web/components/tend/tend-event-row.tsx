"use client";

import { FormField } from "@/components/forms/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEventDate } from "@/lib/design/relative-time";
import { useI18n } from "@/lib/i18n/client";
import type { TendEventResponse } from "@/lib/items/serialize";
import { dateInputToIso, isoToDateInputValue } from "@/lib/onboarding/constants";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface TendEventRowProps {
  event: TendEventResponse;
  onUpdate: (eventId: string, tendedAt: string) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
}

export function TendEventRow({ event, onUpdate, onDelete }: TendEventRowProps) {
  const { locale, t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState(isoToDateInputValue(event.tendedAt));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      await onUpdate(event.id, dateInputToIso(dateValue));
      setEditing(false);
    } catch {
      setError(t("errors.activity.update"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `${t("activity.event.confirmRemove.title")} ${t("activity.event.confirmRemove.message")}`,
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await onDelete(event.id);
    } catch {
      setError(t("errors.activity.delete"));
      setDeleting(false);
    }
  }

  function handleCancel() {
    setDateValue(isoToDateInputValue(event.tendedAt));
    setEditing(false);
    setError(null);
  }

  return (
    <li className="rounded-lg border border-border bg-card px-4 py-3">
      {editing ? (
        <div className="flex flex-col gap-3">
          <FormField id={`event-date-${event.id}`} label={t("activity.event.tendedOn")}>
            <Input
              id={`event-date-${event.id}`}
              type="date"
              value={dateValue}
              onChange={(changeEvent) => setDateValue(changeEvent.target.value)}
            />
          </FormField>

          {error ? (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? t("common.saving") : t("activity.event.saveDate")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <time className="text-sm text-foreground" dateTime={event.tendedAt}>
            {formatEventDate(event.tendedAt, locale)}
          </time>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              disabled={deleting}
              aria-label={t("activity.event.edit")}
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
              aria-label={t("activity.event.remove")}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
