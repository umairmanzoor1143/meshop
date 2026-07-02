import type { Language, TextTranslation } from "../types";
import { DEFAULT_LOCALE, LOCALES, localeToLanguage, type Locale } from "./strings";

export * from "./strings";

/**
 * Render a multilingual field: chosen language → shop default language →
 * any available value. Mirrors the fallback rule in Bruno's DTO notes.
 */
export function resolveText(
  text: TextTranslation | undefined,
  locale: Locale,
  defaultLanguage: Language = "DE"
): string {
  if (!text) return "";
  const primary = localeToLanguage(locale);
  return (
    text[primary] ??
    text[defaultLanguage] ??
    text.DE ??
    Object.values(text).find((v) => !!v) ??
    ""
  );
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
