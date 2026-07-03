"use client";

import { Globe } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Language } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSelect({
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
    <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
      <SelectTrigger
        aria-label="Sprache / Language"
        className={cn(
          "h-10 gap-1.5 rounded-md border-brand-ink/15 bg-transparent px-3 text-sm tracking-wide text-brand-ink hover:border-brand-ink/40 focus:ring-0 focus-visible:ring-0",
          className
        )}
      >
        <Globe width={16} className="text-brand-gray" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[7rem]">
        {enabled.map((lang) => (
          <SelectItem key={lang} value={lang.toLowerCase()} className="text-sm tracking-wide">
            {lang === "DE" ? "Deutsch" : lang === "EN" ? "English" : lang === "FR" ? "Français" : "Italiano"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
