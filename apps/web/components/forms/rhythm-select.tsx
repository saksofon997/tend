"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RHYTHM_CUSTOM_SELECT_VALUE } from "@/lib/forms/rhythm";
import { useI18n } from "@/lib/i18n/client";
import { RHYTHM_TRANSLATION_KEYS } from "@/lib/i18n/labels";
import {
  RHYTHM_MAX_DAYS,
  RHYTHM_MIN_DAYS,
  RHYTHM_OPTIONS,
  type RhythmOption,
  isPresetRhythm,
} from "@/lib/onboarding/constants";
import * as React from "react";

interface RhythmSelectProps {
  value: number;
  onChange: (days: number) => void;
  options?: RhythmOption[];
}

export function RhythmSelect({ value, onChange, options }: RhythmSelectProps) {
  const { t } = useI18n();
  const rhythmOptions = options ?? RHYTHM_OPTIONS;
  const [isCustomMode, setIsCustomMode] = React.useState(
    () => !isPresetRhythm(value, rhythmOptions),
  );
  const [customDaysInput, setCustomDaysInput] = React.useState(() => String(value));
  const previousValueRef = React.useRef(value);

  React.useEffect(() => {
    if (previousValueRef.current === value) {
      return;
    }

    previousValueRef.current = value;
    const custom = !isPresetRhythm(value, rhythmOptions);
    setIsCustomMode(custom);
    setCustomDaysInput(String(value));
  }, [value, rhythmOptions]);

  function handlePresetChange(nextValue: string) {
    if (nextValue === RHYTHM_CUSTOM_SELECT_VALUE) {
      setIsCustomMode(true);
      setCustomDaysInput(String(value));
      return;
    }

    setIsCustomMode(false);
    onChange(Number(nextValue));
  }

  function handleCustomDaysChange(rawValue: string) {
    setCustomDaysInput(rawValue);

    const parsed = Number(rawValue);
    if (Number.isInteger(parsed) && parsed >= RHYTHM_MIN_DAYS && parsed <= RHYTHM_MAX_DAYS) {
      onChange(parsed);
    }
  }

  const selectValue = isCustomMode ? RHYTHM_CUSTOM_SELECT_VALUE : String(value);

  return (
    <div className="flex flex-col gap-2">
      <Select
        id="item-rhythm"
        value={selectValue}
        onChange={(event) => handlePresetChange(event.target.value)}
      >
        {rhythmOptions.map((option) => (
          <option key={option.days} value={option.days}>
            {RHYTHM_TRANSLATION_KEYS[option.days]
              ? t(RHYTHM_TRANSLATION_KEYS[option.days])
              : option.label}
          </option>
        ))}
        <option value={RHYTHM_CUSTOM_SELECT_VALUE}>{t("items.add.rhythm.custom")}</option>
      </Select>

      {isCustomMode ? (
        <div className="flex flex-col gap-1">
          <Input
            id="item-rhythm-custom"
            type="number"
            inputMode="numeric"
            min={RHYTHM_MIN_DAYS}
            max={RHYTHM_MAX_DAYS}
            step={1}
            value={customDaysInput}
            onChange={(event) => handleCustomDaysChange(event.target.value)}
            aria-label={t("items.add.rhythm.customLabel")}
          />
          <p className="text-sm text-muted-foreground">{t("items.add.rhythm.customHelper")}</p>
        </div>
      ) : null}
    </div>
  );
}
