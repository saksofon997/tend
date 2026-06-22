"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
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
  getAttentionSectionDefaults,
  shouldShowAllFreshBanner,
} from "@/lib/design/home-groups";
import { useI18n } from "@/lib/i18n/client";
import type { ItemResponse } from "@/lib/items/serialize";
import { REMINDER_POLL_MS } from "@/lib/reminders/polling";
import type { ReminderResponse, RemindersApiResponse } from "@/lib/reminders/serialize";
import { reminderItemIdsKey, selectReminderBannerItems } from "@/lib/reminders/surface-reminders";
import type { LifeArea } from "@tend/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface HomeViewProps {
  user: { displayName: string };
  initialItems: ItemResponse[];
}

export function HomeView({ user, initialItems }: HomeViewProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [items, setItems] = useState(initialItems);
  const [bannerReminders, setBannerReminders] = useState<ReminderResponse[]>([]);
  const bannerReminderSetKeyRef = useRef("");

  const [lifeAreaFilter, setLifeAreaFilter] = useState<LifeArea | null>(null);
  const [tendError, setTendError] = useState<string | null>(null);

  const updateBannerReminders = useCallback((surfaceNow: ReminderResponse[]) => {
    const selectedReminders = selectReminderBannerItems(surfaceNow);
    const nextKey = reminderItemIdsKey(selectedReminders);

    if (nextKey === bannerReminderSetKeyRef.current) {
      return;
    }

    bannerReminderSetKeyRef.current = nextKey;
    setBannerReminders(selectedReminders);
  }, []);

  const fetchReminders = useCallback(async () => {
    const response = await fetch("/api/v1/reminders");

    if (!response.ok) {
      return;
    }

    const body = (await response.json()) as RemindersApiResponse;
    updateBannerReminders(body.surfaceNow);
  }, [updateBannerReminders]);

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
  const sectionDefaults = useMemo(
    () => getAttentionSectionDefaults(groups.needsAttention.length, groups.gettingStale.length),
    [groups.needsAttention.length, groups.gettingStale.length],
  );

  async function handleTend(itemId: string) {
    setTendError(null);

    const response = await fetch(`/api/v1/items/${itemId}/tend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      setTendError(t("errors.item.mark"));
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
        sharedWith={item.sharedWith}
        onTend={handleTend}
        subdued={item.status === "fresh"}
      />
    );
  }

  return (
    <AppShell user={user} activePath="/">
      <PageHeader
        title={t("home.title", { name: user.displayName })}
        action={
          <Button asChild>
            <Link href="/items/new">{t("home.addItem")}</Link>
          </Button>
        }
      />

      {tendError ? (
        <Alert variant="error" className="mb-6">
          {tendError}
        </Alert>
      ) : null}

      {bannerReminders.length > 0 ? (
        <ReminderBanner reminders={bannerReminders} onTend={handleTend} />
      ) : null}

      {items.length === 0 ? (
        <EmptyStatePreset
          preset="no-items"
          action={
            <Button asChild>
              <Link href="/items/new">{t("home.addFirstItem")}</Link>
            </Button>
          }
        />
      ) : filteredItems.length === 0 ? (
        <>
          <LifeAreaFilter selected={lifeAreaFilter} onChange={setLifeAreaFilter} defaultOpen />
          <EmptyState
            title={t("home.areaEmpty.title")}
            description={t("home.areaEmpty.body")}
            action={
              <Button type="button" variant="secondary" onClick={() => setLifeAreaFilter(null)}>
                {t("common.showAllItems")}
              </Button>
            }
          />
        </>
      ) : (
        <>
          <LifeAreaFilter selected={lifeAreaFilter} onChange={setLifeAreaFilter} />

          {shouldShowAllFreshBanner(groups) ? (
            <EmptyStatePreset preset="all-fresh" className="mb-8" />
          ) : null}

          <AttentionSection
            key={sectionDefaults.needsAttention ? "needs-open" : "needs-closed"}
            title={t("sections.needsAttention")}
            count={groups.needsAttention.length}
            defaultOpen={sectionDefaults.needsAttention}
            emptyMessage={t("sections.empty.needsAttention")}
          >
            {groups.needsAttention.map(renderItemCard)}
          </AttentionSection>

          <AttentionSection
            key={sectionDefaults.gettingStale ? "stale-open" : "stale-closed"}
            title={t("sections.gettingStale")}
            count={groups.gettingStale.length}
            defaultOpen={sectionDefaults.gettingStale}
            emptyMessage={t("sections.empty.gettingStale")}
          >
            {groups.gettingStale.map(renderItemCard)}
          </AttentionSection>

          <AttentionSection
            title={t("sections.lookingGood")}
            count={groups.lookingGood.length}
            defaultOpen={sectionDefaults.lookingGood}
            emptyMessage={t("sections.empty.lookingGood")}
          >
            {groups.lookingGood.map(renderItemCard)}
          </AttentionSection>
        </>
      )}
    </AppShell>
  );
}
