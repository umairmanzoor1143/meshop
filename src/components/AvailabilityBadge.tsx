"use client";

import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

type Status = "UNLIMITED" | "LIMITED" | "UNAVAILABLE";

export function AvailabilityBadge({ status, className }: { status: Status; className?: string }) {
  const { t } = useLocale();
  if (status === "UNLIMITED") return null; // no badge needed when freely available

  const label = status === "LIMITED" ? t.limited : t.unavail;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium",
        status === "LIMITED" ? "text-brand-gold" : "text-brand-gray",
        className
      )}
    >
      <span
        className={cn(
          "inline-block w-1.5 h-1.5 rounded-full",
          status === "LIMITED" ? "bg-brand-gold" : "bg-brand-gray"
        )}
      />
      {label}
    </span>
  );
}
