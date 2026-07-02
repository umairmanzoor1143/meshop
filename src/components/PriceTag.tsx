import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PriceTag({
  price,
  compareAt,
  discountPct = 0,
  currency = "CHF",
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number | null;
  discountPct?: number;
  currency?: Currency;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const onSale = compareAt != null && compareAt > price;
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-light text-brand-ink tracking-tight",
          size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base"
        )}
      >
        {formatMoney(price, currency)}
      </span>
      {onSale && (
        <span
          className={cn(
            "text-brand-gray line-through decoration-brand-gray/50",
            size === "lg" ? "text-sm" : "text-xs"
          )}
        >
          {formatMoney(compareAt!, currency)}
        </span>
      )}
      {onSale && discountPct > 0 && (
        <span className="text-[10px] font-medium uppercase tracking-wide text-brand-green">
          −{discountPct}%
        </span>
      )}
    </div>
  );
}
