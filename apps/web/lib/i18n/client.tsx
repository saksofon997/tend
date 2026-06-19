"use client";

import { type Locale, type TranslationKey, dictionaries } from "@/lib/i18n/dictionaries";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LOCALE_STORAGE_KEY = "tend.locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "sr";
}

function translate(
  locale: Locale,
  key: TranslationKey,
  params: Record<string, string | number> = {},
) {
  let value = dictionaries[locale][key] ?? dictionaries.en[key];

  for (const [paramKey, paramValue] of Object.entries(params)) {
    value = value.replace(`{{${paramKey}}}`, String(paramValue));
  }

  return value;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(storedLocale)) {
      setLocaleState(storedLocale);
      document.documentElement.lang = storedLocale;
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale(nextLocale) {
        setLocaleState(nextLocale);
        window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        document.documentElement.lang = nextLocale;
      },
      t(key, params) {
        return translate(locale, key, params);
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}

export type { Locale, TranslationKey };
