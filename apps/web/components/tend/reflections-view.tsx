"use client";

import { DatePickerField } from "@/components/forms/date-picker-field";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ReflectionLeaf } from "@/components/tend/reflection-leaf";
import { ReflectionsMonthGrid } from "@/components/tend/reflections-month-grid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { formatDatePickerLabel } from "@/lib/design/relative-time";
import { useI18n } from "@/lib/i18n/client";
import { entriesByDate, reflectionDayKind, todayCalendarDate } from "@/lib/reflections/dates";
import type { ReflectionResponse } from "@/lib/reflections/serialize";
import { REFLECTION_BODY_MAX_LENGTH, notebookDates, reflectionMonthLabelParts } from "@tend/domain";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ReflectionsViewProps {
  user: { displayName: string };
  initialEntries: ReflectionResponse[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function ReflectionsView({ user, initialEntries }: ReflectionsViewProps) {
  const { locale, t } = useI18n();
  const today = todayCalendarDate();
  const [entries, setEntries] = useState(initialEntries);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => reflectionMonthLabelParts(today));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notebookApi, setNotebookApi] = useState<CarouselApi>();
  const saveTimers = useRef<Record<string, number>>({});
  const selectedDateRef = useRef(selectedDate);
  const didScrollNotebookToToday = useRef(false);
  selectedDateRef.current = selectedDate;

  const storedBodies = useMemo(() => {
    const map = new Map<string, string>();
    for (const [date, row] of entriesByDate(entries)) {
      map.set(date, drafts[date] ?? row.body);
    }
    for (const [date, body] of Object.entries(drafts)) {
      if (!map.has(date)) {
        map.set(date, body);
      }
    }
    return map;
  }, [drafts, entries]);

  const selectedBody = storedBodies.get(selectedDate) ?? "";
  const notebookPages = useMemo(
    () =>
      notebookDates({
        today,
        entryDates: [...storedBodies.entries()]
          .filter(([, body]) => body.trim().length > 0)
          .map(([date]) => date),
        selectedDate,
      }),
    [selectedDate, storedBodies, today],
  );

  const persistLeaf = useCallback(
    async (entryDate: string, body: string) => {
      setSaveState("saving");
      setError(null);

      try {
        const response = await fetch(`/api/v1/reflections/${entryDate}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });

        if (!response.ok) {
          throw new Error("save-failed");
        }

        const payload = (await response.json()) as { entry: ReflectionResponse | null };
        setEntries((current) => {
          const without = current.filter((entry) => entry.entryDate !== entryDate);
          return payload.entry ? [payload.entry, ...without] : without;
        });
        setSaveState("saved");
      } catch {
        setSaveState("error");
        setError(t("errors.reflections.save"));
      }
    },
    [t],
  );

  function queueSave(entryDate: string, body: string) {
    const timers = saveTimers.current;
    window.clearTimeout(timers[entryDate]);
    timers[entryDate] = window.setTimeout(() => {
      void persistLeaf(entryDate, body);
    }, 600);
  }

  function handleBodyChange(entryDate: string, body: string) {
    setDrafts((current) => ({ ...current, [entryDate]: body }));
    setSaveState("idle");
    queueSave(entryDate, body);
  }

  function selectDate(nextDate: string) {
    setSelectedDate(nextDate);
    setVisibleMonth(reflectionMonthLabelParts(nextDate));
    const index = notebookPages.indexOf(nextDate);
    if (index >= 0) {
      notebookApi?.scrollTo(index);
    }
  }

  useEffect(() => {
    return () => {
      for (const timer of Object.values(saveTimers.current)) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (!notebookApi) {
      return;
    }

    if (!didScrollNotebookToToday.current) {
      const todayIndex = notebookPages.indexOf(today);
      if (todayIndex >= 0) {
        notebookApi.scrollTo(todayIndex, true);
        didScrollNotebookToToday.current = true;
      }
    }

    function syncSelectedFromNotebook(api: NonNullable<CarouselApi>) {
      const date = notebookPages[api.selectedScrollSnap()];
      if (date && date !== selectedDateRef.current) {
        setSelectedDate(date);
        setVisibleMonth(reflectionMonthLabelParts(date));
      }
    }

    syncSelectedFromNotebook(notebookApi);
    notebookApi.on("select", syncSelectedFromNotebook);

    return () => {
      notebookApi.off("select", syncSelectedFromNotebook);
    };
  }, [notebookApi, notebookPages, today]);

  function dayLabel(date: string) {
    const kind = reflectionDayKind(date, today);
    if (kind === "today") {
      return t("reflections.today");
    }
    if (kind === "yesterday") {
      return t("reflections.yesterday");
    }
    return formatDatePickerLabel(date, locale);
  }

  function characterCountLabel(body: string) {
    return t("reflections.characterCount", {
      count: body.length,
      max: REFLECTION_BODY_MAX_LENGTH,
    });
  }

  return (
    <AppShell user={user} activePath="/reflections">
      <PageHeader title={t("reflections.title")} subtitle={t("reflections.subtitle")} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Label
              htmlFor="reflection-date"
              className="mb-1 block text-muted-foreground text-xs font-normal"
            >
              {t("reflections.chooseDate")}
            </Label>
            <DatePickerField id="reflection-date" value={selectedDate} onChange={selectDate} />
          </div>
          <Button type="button" variant="secondary" onClick={() => selectDate(today)}>
            {t("reflections.goToToday")}
          </Button>
          <p className="text-muted-foreground text-xs" aria-live="polite">
            {saveState === "saving"
              ? t("reflections.saving")
              : saveState === "saved"
                ? t("reflections.saved")
                : null}
          </p>
        </div>

        {error ? (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="hidden md:block">
          <ReflectionLeaf
            id={`reflection-editor-${selectedDate}`}
            dateLabel={dayLabel(selectedDate)}
            body={selectedBody}
            placeholder={t("reflections.placeholder")}
            onChange={(body) => handleBodyChange(selectedDate, body)}
            characterCountLabel={characterCountLabel(selectedBody)}
          />
        </div>

        <ReflectionsMonthGrid
          year={visibleMonth.year}
          month={visibleMonth.month}
          selectedDate={selectedDate}
          today={today}
          bodies={storedBodies}
          onSelect={selectDate}
          onMonthChange={setVisibleMonth}
        />

        <Carousel
          orientation="vertical"
          setApi={setNotebookApi}
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            watchDrag: (_api, event) => {
              const target = event.target;
              return !(target instanceof HTMLElement && target.closest("textarea"));
            },
          }}
          className="tend-reflections-notebook md:hidden"
          aria-label={t("reflections.notebook")}
        >
          <CarouselContent className="h-[min(36rem,calc(100dvh-14rem))]">
            {notebookPages.map((date) => {
              const body = storedBodies.get(date) ?? "";
              return (
                <CarouselItem key={date} className="h-full">
                  <ReflectionLeaf
                    id={`reflection-notebook-${date}`}
                    dateLabel={dayLabel(date)}
                    body={body}
                    placeholder={t("reflections.placeholder")}
                    onChange={(next) => {
                      selectDate(date);
                      handleBodyChange(date, next);
                    }}
                    characterCountLabel={characterCountLabel(body)}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </AppShell>
  );
}
