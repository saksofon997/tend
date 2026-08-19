"use client";

import { DatePickerField } from "@/components/forms/date-picker-field";
import { FormField } from "@/components/forms/form-field";
import { RhythmSelect } from "@/components/forms/rhythm-select";
import { TypeSelector } from "@/components/forms/type-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { validateItemForm } from "@/lib/forms/item-form-validation";
import { useI18n } from "@/lib/i18n/client";
import { LIFE_AREA_TRANSLATION_KEYS } from "@/lib/i18n/labels";
import { ITEM_NAME_MAX_LENGTH } from "@/lib/items/constants";
import { LIFE_AREA_ORDER, todayDateInputValue } from "@/lib/onboarding/constants";
import type { LifeArea, TendItemType } from "@tend/domain";
import * as React from "react";

export interface ItemFormValues {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  lastTendedDate: string;
  sharedWithEmail: string;
}

interface ItemFormProps {
  initial?: Partial<ItemFormValues>;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  error?: string | null;
  submitting?: boolean;
}

export function ItemForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  error,
  submitting = false,
}: ItemFormProps) {
  const { t } = useI18n();
  const todayDate = React.useMemo(() => todayDateInputValue(), []);
  const [name, setName] = React.useState(() =>
    (initial?.name ?? "").slice(0, ITEM_NAME_MAX_LENGTH),
  );
  const [type, setType] = React.useState<TendItemType>(initial?.type ?? "want");
  const [rhythmDays, setRhythmDays] = React.useState(initial?.rhythmDays ?? 7);
  const [lifeArea, setLifeArea] = React.useState<LifeArea | null>(initial?.lifeArea ?? null);
  const [lastTendedDate, setLastTendedDate] = React.useState(initial?.lastTendedDate ?? todayDate);
  const [sharedWithEmail, setSharedWithEmail] = React.useState(initial?.sharedWithEmail ?? "");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values = { name, type, rhythmDays, lifeArea, lastTendedDate, sharedWithEmail };
    const validationErrors = validateItemForm(values, todayDate);

    if (validationErrors) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField
        id="item-name"
        label={t("items.add.name.label")}
        required
        error={fieldErrors.name}
        counter={{ length: name.length, max: ITEM_NAME_MAX_LENGTH }}
      >
        <Input
          id="item-name"
          value={name}
          onChange={(event) => setName(event.target.value.slice(0, ITEM_NAME_MAX_LENGTH))}
          maxLength={ITEM_NAME_MAX_LENGTH}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={
            fieldErrors.name ? "item-name-error item-name-counter" : "item-name-counter"
          }
          required
        />
      </FormField>

      <FormField id="item-type" label={t("items.add.type.label")}>
        <TypeSelector value={type} onChange={setType} />
      </FormField>

      <FormField
        id="item-rhythm"
        label={t("items.add.rhythm.label")}
        error={fieldErrors.rhythmDays}
      >
        <RhythmSelect value={rhythmDays} onChange={setRhythmDays} />
      </FormField>

      <FormField
        id="item-life-area"
        label={t("items.add.lifeArea.label")}
        helper={t("items.add.lifeArea.helper")}
      >
        <Select
          id="item-life-area"
          value={lifeArea ?? ""}
          onChange={(event) =>
            setLifeArea(event.target.value ? (event.target.value as LifeArea) : null)
          }
        >
          <option value="">{t("common.none")}</option>
          {LIFE_AREA_ORDER.map((area) => (
            <option key={area} value={area}>
              {t(LIFE_AREA_TRANSLATION_KEYS[area])}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        id="item-shared-with"
        label={t("items.add.sharedWith.label")}
        helper={t("items.add.sharedWith.helper")}
        error={fieldErrors.sharedWithEmail}
      >
        <Input
          id="item-shared-with"
          type="email"
          value={sharedWithEmail}
          onChange={(event) => setSharedWithEmail(event.target.value)}
          placeholder={t("items.add.sharedWith.placeholder")}
          aria-invalid={Boolean(fieldErrors.sharedWithEmail)}
        />
      </FormField>

      <FormField
        id="item-last-tended"
        label={t("items.add.lastTended.label")}
        error={fieldErrors.lastTendedDate}
      >
        <DatePickerField
          id="item-last-tended"
          value={lastTendedDate}
          onChange={setLastTendedDate}
          max={todayDate}
          invalid={Boolean(fieldErrors.lastTendedDate)}
        />
      </FormField>

      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? t("common.saving") : (submitLabel ?? t("common.save"))}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            {t("common.back")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
