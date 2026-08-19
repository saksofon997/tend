"use client";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  type ActivitySearchFilters,
  EMPTY_ACTIVITY_SEARCH_FILTERS,
  hasActivitySearchFilters,
} from "@/lib/activity/search-filters";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface ActivityFiltersProps {
  value: ActivitySearchFilters;
  onChange: (filters: ActivitySearchFilters) => void;
}

export function ActivityFilters({ value, onChange }: ActivityFiltersProps) {
  const { t } = useI18n();
  const filtersActive = hasActivitySearchFilters(value);

  function patch(partial: Partial<ActivitySearchFilters>) {
    onChange({ ...value, ...partial });
  }

  return (
    <section className="mb-8" aria-labelledby="activity-search-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="activity-search-heading" className="font-medium text-foreground text-sm">
          {t("activity.search.title")}
        </h2>
        {filtersActive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_ACTIVITY_SEARCH_FILTERS)}
          >
            {t("activity.search.clear")}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          id="activity-search-name"
          label={t("activity.search.name")}
          className="sm:col-span-2"
        >
          <Input
            id="activity-search-name"
            type="search"
            value={value.q}
            onChange={(event) => patch({ q: event.target.value })}
            placeholder={t("activity.search.namePlaceholder")}
            autoComplete="off"
          />
        </FormField>

        <FormField id="activity-search-type" label={t("activity.search.type")}>
          <Select
            id="activity-search-type"
            value={value.type}
            onChange={(event) =>
              patch({ type: event.target.value as ActivitySearchFilters["type"] })
            }
          >
            <option value="">{t("activity.search.typeAll")}</option>
            <option value="must">{t("type.must")}</option>
            <option value="want">{t("type.want")}</option>
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="activity-search-from" label={t("activity.search.from")}>
            <Input
              id="activity-search-from"
              type="date"
              value={value.from}
              onChange={(event) => patch({ from: event.target.value })}
              aria-invalid={Boolean(value.from && value.to && value.from > value.to)}
            />
          </FormField>
          <FormField id="activity-search-to" label={t("activity.search.to")}>
            <Input
              id="activity-search-to"
              type="date"
              value={value.to}
              onChange={(event) => patch({ to: event.target.value })}
              className={cn(
                value.from && value.to && value.from > value.to && "border-destructive",
              )}
            />
          </FormField>
        </div>
      </div>
    </section>
  );
}
