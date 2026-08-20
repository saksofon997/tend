"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CheckInPeriodFilter } from "@/components/tend/check-in-period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/client";
import { LIFE_AREA_TRANSLATION_KEYS, WEEKDAY_TRANSLATION_KEYS } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";
import type { CheckInPeriod, CheckInSummary } from "@tend/domain";
import { weeklySupportTone } from "@tend/domain";
import { CalendarDays, HeartHandshake, Leaf, ListChecks, Sprout, SunMedium } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface CheckInViewProps {
  user: { displayName: string };
  period: CheckInPeriod;
  summary: CheckInSummary;
}

export function CheckInView({ user, period, summary }: CheckInViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const hasHistory = summary.totalTends > 0;
  const tone = weeklySupportTone(summary.totalTends);
  const noteKey =
    tone === "quiet"
      ? "checkIn.note.quiet"
      : tone === "present"
        ? "checkIn.note.present"
        : "checkIn.note.steady";

  return (
    <AppShell user={user} activePath="/check-in">
      <PageHeader title={t("checkIn.title")} subtitle={t("checkIn.subtitle")} />

      <div className="flex flex-col gap-5">
        <CheckInPeriodFilter
          period={period}
          onChange={(nextPeriod) => {
            router.replace(nextPeriod === "week" ? "/check-in" : `/check-in?period=${nextPeriod}`);
          }}
        />

        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{t(noteKey)}</p>

        <section className="grid gap-3 sm:grid-cols-3">
          <CheckInStatCard
            icon={<Sprout aria-hidden className="size-4" />}
            label={t("checkIn.stat.tendingLogged.label")}
            value={summary.totalTends.toString()}
            helper={
              summary.tendedItemCount > 0
                ? t("checkIn.stat.tendingLogged.helper", { count: summary.tendedItemCount })
                : t("checkIn.stat.tendingLogged.empty")
            }
          />
          <CheckInStatCard
            icon={<SunMedium aria-hidden className="size-4" />}
            label={t("checkIn.stat.careDays.label")}
            value={summary.careDays.toString()}
            helper={
              summary.careDays > 0
                ? t("checkIn.stat.careDays.helper")
                : t("checkIn.stat.careDays.empty")
            }
          />
          <CheckInStatCard
            icon={<HeartHandshake aria-hidden className="size-4" />}
            label={t("checkIn.stat.shared.label")}
            value={summary.sharedItemCount.toString()}
            helper={
              summary.mostTendedWith
                ? t("checkIn.stat.shared.helper", { name: summary.mostTendedWith.displayName })
                : t("checkIn.stat.shared.empty")
            }
          />
        </section>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">{t("checkIn.patterns.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <PatternRow
              icon={<ListChecks aria-hidden className="size-4" />}
              label={t("checkIn.pattern.mostTended.label")}
              value={
                summary.mostTendedItem
                  ? summary.mostTendedItem.name
                  : t("checkIn.pattern.mostTended.empty")
              }
              detail={
                summary.mostTendedItem
                  ? t("checkIn.tendedMoments", { count: summary.mostTendedItem.count })
                  : t("checkIn.pattern.mostTended.emptyDetail")
              }
            />
            <PatternRow
              icon={<HeartHandshake aria-hidden className="size-4" />}
              label={t("checkIn.pattern.with.label")}
              value={summary.mostTendedWith?.displayName ?? t("checkIn.pattern.with.empty")}
              detail={
                summary.mostTendedWith
                  ? t("checkIn.sharedTendedMoments", { count: summary.mostTendedWith.count })
                  : t("checkIn.pattern.with.emptyDetail")
              }
            />
            <PatternRow
              icon={<Leaf aria-hidden className="size-4" />}
              label={t("checkIn.pattern.area.label")}
              value={
                summary.mostTendedLifeArea
                  ? t(LIFE_AREA_TRANSLATION_KEYS[summary.mostTendedLifeArea.lifeArea])
                  : t("checkIn.pattern.area.empty")
              }
              detail={
                summary.mostTendedLifeArea
                  ? t("checkIn.tendedMoments", { count: summary.mostTendedLifeArea.count })
                  : t("checkIn.pattern.area.emptyDetail")
              }
            />
            <PatternRow
              icon={<CalendarDays aria-hidden className="size-4" />}
              label={t("checkIn.pattern.day.label")}
              value={
                summary.mostActiveWeekday
                  ? t(WEEKDAY_TRANSLATION_KEYS[summary.mostActiveWeekday.weekday])
                  : t("checkIn.pattern.day.empty")
              }
              detail={
                summary.mostActiveWeekday
                  ? t("checkIn.tendedMoments", { count: summary.mostActiveWeekday.count })
                  : t("checkIn.pattern.day.emptyDetail")
              }
            />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">{t("checkIn.weekday.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2" aria-label={t("checkIn.weekday.label")}>
              {summary.weekdayCounts.map((entry) => {
                const active = entry.count > 0;
                return (
                  <div key={entry.weekday} className="min-w-0 text-center">
                    <div
                      className={cn(
                        "flex min-h-12 items-center justify-center border px-1 text-sm",
                        "tend-thought-inset",
                        active
                          ? "border-[var(--tend-status-fresh)] bg-[var(--tend-status-fresh-bg)] text-[var(--tend-status-fresh)]"
                          : "border-border bg-muted/50 text-muted-foreground",
                      )}
                    >
                      {entry.count}
                    </div>
                    <div className="mt-2 truncate text-muted-foreground text-xs">
                      {weekdayShortLabel(t(WEEKDAY_TRANSLATION_KEYS[entry.weekday]))}
                    </div>
                  </div>
                );
              })}
            </div>
            {!hasHistory ? (
              <p className="mt-4 text-muted-foreground text-sm">{t("checkIn.weekday.empty")}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">{t("checkIn.rightNow.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <AttentionPill
                label={t("sections.needsAttention")}
                value={summary.attentionCounts.needsAttention}
              />
              <AttentionPill
                label={t("sections.gettingStale")}
                value={summary.attentionCounts.gettingStale}
              />
              <AttentionPill label={t("status.fresh")} value={summary.attentionCounts.fresh} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function CheckInStatCard({
  helper,
  icon,
  label,
  value,
}: {
  helper: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-primary text-sm">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <div className="mt-3 font-display text-3xl text-foreground">{value}</div>
        <p className="mt-1 text-muted-foreground text-sm">{helper}</p>
      </CardContent>
    </Card>
  );
}

function PatternRow({
  detail,
  icon,
  label,
  value,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="tend-thought-inset flex gap-3 border border-border bg-background/60 p-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div className="min-w-0">
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className="mt-1 break-words font-medium text-foreground text-sm">{value}</div>
        <div className="mt-1 text-muted-foreground text-xs">{detail}</div>
      </div>
    </div>
  );
}

function AttentionPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="tend-thought-inset border border-border bg-muted/40 p-3">
      <div className="font-display text-2xl text-foreground">{value}</div>
      <div className="mt-1 text-muted-foreground text-sm">{label}</div>
    </div>
  );
}

function weekdayShortLabel(label: string) {
  return label.slice(0, 3);
}
