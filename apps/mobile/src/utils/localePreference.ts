import { type Locale, isLocale, setLocale } from "@/i18n";

/** Restore a stored language choice, or ignore unknown values. */
export function localeFromStorage(value: string | null | undefined): Locale | null {
  return isLocale(value) ? value : null;
}

/** Apply a locale immediately so the next `t()` call uses it. */
export function applyLocale(locale: Locale): Locale {
  setLocale(locale);
  return locale;
}
