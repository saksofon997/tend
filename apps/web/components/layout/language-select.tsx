"use client";

import { Select } from "@/components/ui/select";
import { type Locale, useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface LanguageSelectProps {
  id: string;
  className?: string;
}

export function LanguageSelect({ id, className }: LanguageSelectProps) {
  const { locale, setLocale, t } = useI18n();

  function handleChange(value: string) {
    setLocale(value === "sr" ? "sr" : "en");
  }

  const options: Array<{ value: Locale; label: string }> = [
    { value: "en", label: t("language.english") },
    { value: "sr", label: t("language.serbian") },
  ];

  return (
    <>
      <label className="sr-only" htmlFor={id}>
        {t("language.label")}
      </label>
      <Select
        id={id}
        aria-label={t("language.label")}
        className={cn("h-9 w-[6.75rem] py-1 pr-7 pl-2 text-sm sm:w-[7.5rem]", className)}
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </>
  );
}
