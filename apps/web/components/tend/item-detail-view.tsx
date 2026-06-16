"use client";

import { ItemForm, type ItemFormValues } from "@/components/forms/item-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MarkTendedButton } from "@/components/tend/mark-tended-button";
import { RelativeTime } from "@/components/tend/relative-time";
import { StatusBadge } from "@/components/tend/status-badge";
import { TendEventRow } from "@/components/tend/tend-event-row";
import { TypeBadge } from "@/components/tend/type-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRhythm } from "@/lib/design/relative-time";
import type { ItemResponse, TendEventResponse } from "@/lib/items/serialize";
import {
  LIFE_AREA_LABELS,
  dateInputToIso,
  isoToDateInputValue,
  todayDateInputValue,
} from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ItemDetailViewProps {
  user: { displayName: string };
  initialItem: ItemResponse;
  initialEvents: TendEventResponse[];
}

export function ItemDetailView({ user, initialItem, initialEvents }: ItemDetailViewProps) {
  const router = useRouter();
  const todayDate = todayDateInputValue();
  const [item, setItem] = useState(initialItem);
  const [events, setEvents] = useState(initialEvents);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isMustAttention = item.type === "must" && item.status === "needs_attention";

  async function handleTend(itemId: string) {
    setError(null);

    const response = await fetch(`/api/v1/items/${itemId}/tend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      setError("Could not mark this item as tended. Please try again.");
      return;
    }

    const body = (await response.json()) as { item: ItemResponse; event: TendEventResponse };
    setItem(body.item);
    setEvents((current) => [body.event, ...current.filter((event) => event.id !== body.event.id)]);
    router.refresh();
  }

  async function handleEditSubmit(values: ItemFormValues) {
    if (!values.name.trim()) {
      setError("Give your item a name");
      return;
    }

    setSubmitting(true);
    setError(null);

    const response = await fetch(`/api/v1/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        type: values.type,
        rhythmDays: values.rhythmDays,
        lifeArea: values.lifeArea,
        lastTendedAt: dateInputToIso(values.lastTendedDate),
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Unable to save changes");
      setSubmitting(false);
      return;
    }

    const body = (await response.json()) as { item: ItemResponse };
    setItem(body.item);
    setEditing(false);
    setSubmitting(false);

    const detailResponse = await fetch(`/api/v1/items/${item.id}`);
    if (detailResponse.ok) {
      const detail = (await detailResponse.json()) as {
        item: ItemResponse;
        recentEvents: TendEventResponse[];
      };
      setItem(detail.item);
      setEvents(detail.recentEvents);
    }

    router.refresh();
  }

  async function handleEventUpdate(eventId: string, tendedAt: string) {
    const response = await fetch(`/api/v1/activity/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tendedAt }),
    });

    if (!response.ok) {
      throw new Error("Update failed");
    }

    const body = (await response.json()) as { item: ItemResponse; event: TendEventResponse };
    setItem(body.item);
    setEvents((current) =>
      current
        .map((event) => (event.id === eventId ? body.event : event))
        .sort((a, b) => new Date(b.tendedAt).getTime() - new Date(a.tendedAt).getTime()),
    );
    router.refresh();
  }

  async function handleEventDelete(eventId: string) {
    const response = await fetch(`/api/v1/activity/${eventId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    const body = (await response.json()) as { item: ItemResponse };
    setItem(body.item);
    setEvents((current) => current.filter((event) => event.id !== eventId));
    router.refresh();
  }

  return (
    <AppShell user={user} activePath="/">
      <PageHeader
        title={item.name}
        subtitle="Rhythm, status, and recent tending history."
        action={
          <Button asChild variant="secondary">
            <Link href="/">Back to home</Link>
          </Button>
        }
      />

      {error ? (
        <Alert variant="error" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {editing ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Edit item</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemForm
              initial={{
                name: item.name,
                type: item.type,
                rhythmDays: item.rhythmDays,
                lifeArea: item.lifeArea,
                lastTendedDate: isoToDateInputValue(item.lastTendedAt, todayDate),
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setEditing(false);
                setError(null);
              }}
              submitLabel="Save changes"
              submitting={submitting}
            />
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            "mb-8",
            isMustAttention &&
              "border-l-4 border-l-[var(--tend-type-must-border)] bg-[var(--tend-type-must-bg)]",
          )}
        >
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={item.type} />
                <StatusBadge status={item.status} />
              </div>
              <p className="text-sm text-muted-foreground">{formatRhythm(item.rhythmDays)}</p>
              <RelativeTime
                date={item.lastTendedAt}
                daysSince={item.daysSinceLastTended}
                className="block"
              />
              {item.lifeArea ? (
                <p className="text-sm text-muted-foreground">{LIFE_AREA_LABELS[item.lifeArea]}</p>
              ) : null}
            </div>
            <MarkTendedButton itemId={item.id} onTend={handleTend} />
          </CardHeader>
          <CardContent>
            <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
              Edit item
            </Button>
          </CardContent>
        </Card>
      )}

      <section aria-labelledby="recent-events-heading">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h2
            id="recent-events-heading"
            className="font-display text-xl font-medium text-foreground"
          >
            Recent tending
          </h2>
          <p className="text-sm text-muted-foreground">
            Correct dates if you logged something wrong.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tending logged yet for this item.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((event) => (
              <TendEventRow
                key={event.id}
                event={event}
                onUpdate={handleEventUpdate}
                onDelete={handleEventDelete}
              />
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
