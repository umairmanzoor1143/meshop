import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PriceTag({
  price,
  compareAt,
  discountPct = 0,
  currency = "CHF",
  size = "md",
  stack = false,
  className,
}: {
  price: number;
  compareAt?: number | null;
  discountPct?: number;
  currency?: Currency;
  size?: "sm" | "md" | "lg";
  stack?: boolean;
  className?: string;
}) {
  const onSale = compareAt != null && compareAt > price;
  const priceClass = cn(
    "font-medium text-brand-ink tracking-tight whitespace-nowrap",
    size === "lg" ? "text-xl sm:text-2xl" : size === "sm" ? "text-sm sm:text-base" : "text-lg"
  );
  const struckClass = cn(
    "text-brand-gray line-through decoration-brand-gray/50 whitespace-nowrap",
    size === "lg" ? "text-sm sm:text-base" : "text-xs sm:text-sm"
  );
  const discountClass = "text-[11px] font-medium uppercase tracking-wide text-brand-green";

  // Stacked (up/down): current price on top, struck compare-at beneath.
  if (stack) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <span className={priceClass}>{formatMoney(price, currency)}</span>
        {onSale && (
          <div className="flex items-center gap-2">
            <span className={struckClass}>{formatMoney(compareAt!, currency)}</span>
            {discountPct > 0 && <span className={discountClass}>−{discountPct}%</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={priceClass}>{formatMoney(price, currency)}</span>
      {onSale && <span className={struckClass}>{formatMoney(compareAt!, currency)}</span>}
      {onSale && discountPct > 0 && <span className={discountClass}>−{discountPct}%</span>}
    </div>
  );
}
