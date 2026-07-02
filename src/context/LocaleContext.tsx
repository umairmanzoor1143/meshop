"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Language, TextTranslation } from "@/lib/types";
import {
  DEFAULT_LOCALE,
  getStrings,
  localeToLanguage,
  normalizeLocale,
  resolveText,
  type Locale,
  type Strings,
} from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  language: Language;
  defaultLanguage: Language;
  setLocale: (l: Locale) => void;
  t: Strings;
  /** Resolve a multilingual field into the current locale. */
  tx: (text: TextTranslation | undefined) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "meshop.locale";

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  defaultLanguage = "DE",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
  defaultLanguage?: Language;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved) setLocaleState(normalizeLocale(saved));
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      language: localeToLanguage(locale),
      defaultLanguage,
      setLocale,
      t: getStrings(locale),
      tx: (text) => resolveText(text, locale, defaultLanguage),
    }),
    [locale, defaultLanguage, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
