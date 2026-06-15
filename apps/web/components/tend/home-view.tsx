"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AttentionHero } from "@/components/tend/attention-hero";
import { AttentionSection } from "@/components/tend/attention-section";
import { EmptyState, EmptyStatePreset } from "@/components/tend/empty-state";
import { LifeAreaFilter } from "@/components/tend/life-area-filter";
import { ReminderBanner } from "@/components/tend/reminder-banner";
import { TendItemCard } from "@/components/tend/tend-item-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  type AttentionListItem,
  buildAttentionGroups,
  shouldShowAllFreshBanner,
} from "@/lib/design/home-groups";
import type { ItemResponse } from "@/lib/items/serialize";
import type { RemindersApiResponse } from "@/lib/reminders/serialize";
import type { LifeArea } from "@tend/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const REMINDER_POLL_MS = 60_000;

interface HomeViewProps {
  user: { displayName: string };
  initialItems: ItemResponse[];
}

export function HomeView({ user, initialItems }: HomeViewProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [reminders, setReminders] = useState<RemindersApiResponse["surfaceNow"]>([]);
  const [lifeAreaFilter, setLifeAreaFilter] = useState<LifeArea | null>(null);
  const [tendError, setTendError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    const response = await fetch("/api/v1/reminders");

    if (!response.ok) {
      return;
    }

    const body = (await response.json()) as RemindersApiResponse;
    setReminders(body.surfaceNow);
  }, []);

  useEffect(() => {
    fetchReminders();

    const interval = window.setInterval(fetchReminders, REMINDER_POLL_MS);
    return () => window.clearInterval(interval);
  }, [fetchReminders]);

  const filteredItems = useMemo(() => {
    if (!lifeAreaFilter) {
      return items;
    }

    return items.filter((item) => item.lifeArea === lifeAreaFilter);
  }, [items, lifeAreaFilter]);

  const groups = useMemo(() => buildAttentionGroups(filteredItems), [filteredItems]);

  async function handleTend(itemId: string) {
    setTendError(null);

    const response = await fetch(`/api/v1/items/${itemId}/tend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      setTendError("Could not mark that item as tended. Please try again.");
      return;
    }

    const body = (await response.json()) as { item: ItemResponse };
    setItems((current) => current.map((item) => (item.id === itemId ? body.item : item)));
    await fetchReminders();
    router.refresh();
  }

  function renderItemCard(item: AttentionListItem) {
    return (
      <TendItemCard
        key={item.id}
        id={item.id}
        name={item.name}
        type={item.type}
        status={item.status}
        lastTendedAt={item.lastTendedAt}
        daysSinceLastTended={item.daysSinceLastTended}
        rhythmDays={item.rhythmDays}
        lifeArea={item.lifeArea}
        onTend={handleTend}
        subdued={item.status === "fresh"}
      />
    );
  }

  const heroItem = groups.hero;

  return (
    <AppShell user={user} activePath="/">
      <PageHeader
        title={`Welcome back, ${user.displayName}`}
        action={
          <Button asChild>
            <Link href="/items/new">Add item</Link>
          </Button>
        }
      />

      {tendError ? (
        <Alert variant="error" className="mb-6">
          {tendError}
        </Alert>
      ) : null}

      {reminders.length > 0 ? <ReminderBanner reminders={reminders} onTend={handleTend} /> : null}

      {items.length === 0 ? (
        <EmptyStatePreset
          preset="no-items"
          action={
            <Button asChild>
              <Link href="/items/new">Add your first item</Link>
            </Button>
          }
        />
      ) : filteredItems.length === 0 ? (
        <>
          <LifeAreaFilter selected={lifeAreaFilter} onChange={setLifeAreaFilter} />
          <EmptyState
            title="No items in this area"
            description="Try another life area, or add something that fits here."
            action={
              <Button type="button" variant="secondary" onClick={() => setLifeAreaFilter(null)}>
                Show all items
              </Button>
            }
          />
        </>
      ) : (
        <>
          <LifeAreaFilter selected={lifeAreaFilter} onChange={setLifeAreaFilter} />

          {heroItem ? <AttentionHero item={heroItem} onTend={handleTend} /> : null}

          {shouldShowAllFreshBanner(groups) ? (
            <EmptyStatePreset preset="all-fresh" className="mb-8" />
          ) : null}

          <AttentionSection
            title="Needs attention"
            count={groups.needsAttention.length}
            emptyMessage="Nothing needs attention right now."
          >
            {groups.needsAttention.map(renderItemCard)}
          </AttentionSection>

          <AttentionSection
            title="Getting stale"
            count={groups.gettingStale.length}
            emptyMessage="Nothing is drifting yet."
          >
            {groups.gettingStale.map(renderItemCard)}
          </AttentionSection>

          <AttentionSection
            title="Looking good"
            count={groups.lookingGood.length}
            defaultOpen={false}
            emptyMessage="No fresh items yet."
          >
            {groups.lookingGood.map(renderItemCard)}
          </AttentionSection>
        </>
      )}
    </AppShell>
  );
}
