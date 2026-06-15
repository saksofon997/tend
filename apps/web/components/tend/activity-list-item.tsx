"use client";

import { FormField } from "@/components/forms/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActivityEntryResponse } from "@/lib/activity/serialize";
import { formatEventDate } from "@/lib/design/relative-time";
import { dateInputToIso, isoToDateInputValue } from "@/lib/onboarding/constants";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ActivityListItemProps {
  entry: ActivityEntryResponse;
  onUpdate: (eventId: string, tendedAt: string) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
}

export function ActivityListItem({ entry, onUpdate, onDelete }: ActivityListItemProps) {
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState(isoToDateInputValue(entry.tendedAt));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      await onUpdate(entry.id, dateInputToIso(dateValue));
      setEditing(false);
    } catch {
      setError("Could not update this event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "Remove this tended event? The item status will update from remaining history.",
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await onDelete(entry.id);
    } catch {
      setError("Could not remove this event. Please try again.");
      setDeleting(false);
    }
  }

  function handleCancel() {
    setDateValue(isoToDateInputValue(entry.tendedAt));
    setEditing(false);
    setError(null);
  }

  return (
    <li className="rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-[var(--tend-bg-muted)]/30">
      {editing ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">{entry.itemName}</p>

          <FormField id={`activity-date-${entry.id}`} label="Tended on">
            <Input
              id={`activity-date-${entry.id}`}
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
              {saving ? "Saving…" : "Save date"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/items/${entry.itemId}`}
              className="truncate font-medium text-foreground hover:text-primary hover:underline"
            >
              {entry.itemName}
            </Link>
            <time className="mt-0.5 block text-sm text-muted-foreground" dateTime={entry.tendedAt}>
              {formatEventDate(entry.tendedAt)}
            </time>
          </div>

          <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              disabled={deleting}
              aria-label={`Edit tended date for ${entry.itemName}`}
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
              aria-label={`Remove tended event for ${entry.itemName}`}
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
