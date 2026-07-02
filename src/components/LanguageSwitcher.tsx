"use client";

import { useLocale } from "@/context/LocaleContext";
import type { Language } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  languages,
  className,
}: {
  languages: Language[];
  className?: string;
}) {
  const { locale, setLocale } = useLocale();
  const enabled = languages.length ? languages : (["DE", "EN"] as Language[]);
  if (enabled.length < 2) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {enabled.map((lang, i) => {
        const l = lang.toLowerCase() as Locale;
        const active = locale === l;
        return (
          <span key={lang} className="flex items-center">
            {i > 0 && <span className="mx-1 text-brand-gray/40">·</span>}
            <button
              type="button"
              onClick={() => setLocale(l)}
              aria-pressed={active}
              className={cn(
                "text-[11px] tracking-wider uppercase transition-colors",
                active ? "text-brand-ink font-medium" : "text-brand-gray hover:text-brand-ink"
              )}
            >
              {lang}
            </button>
          </span>
        );
      })}
    </div>
  );
}
