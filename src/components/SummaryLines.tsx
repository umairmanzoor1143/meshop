"use client";

import { useLocale } from "@/context/LocaleContext";
import { formatMoney, fill } from "@/lib/format";
import type { CartSummary } from "@/lib/pricing";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SummaryLines({
  summary,
  currency = "CHF",
  showShipping = true,
  className,
}: {
  summary: CartSummary;
  currency?: Currency;
  showShipping?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const row = "flex items-center justify-between text-sm";

  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn(row, "text-brand-gray")}>
        <span>{t.subtotal}</span>
        <span className="text-brand-ink">{formatMoney(summary.subtotal, currency)}</span>
      </div>

      {summary.discount > 0 && (
        <div className={cn(row, "text-brand-green")}>
          <span>{t.discount}</span>
          <span>−{formatMoney(summary.discount, currency)}</span>
        </div>
      )}

      {summary.surcharge > 0 && (
        <div className={cn(row, "text-brand-gray")}>
          <span>{t.surcharge}</span>
          <span className="text-brand-ink">{formatMoney(summary.surcharge, currency)}</span>
        </div>
      )}

      {showShipping && (
        <div className={cn(row, "text-brand-gray")}>
          <span>{t.shipping}</span>
          <span className="text-brand-ink">
            {summary.shipping > 0 ? formatMoney(summary.shipping, currency) : t.freeShip}
          </span>
        </div>
      )}

      {summary.freeShippingPossible && summary.remainingForFreeShipping > 0 && (
        <p className="text-[11px] text-brand-green">
          {fill(t.addMoreForFree, { amount: formatMoney(summary.remainingForFreeShipping, currency) })}
        </p>
      )}

      <div className="border-t border-brand-ink/10 pt-3 flex items-center justify-between">
        <span className="text-sm font-medium uppercase tracking-wide">{t.grand}</span>
        <span className="font-serif text-xl text-brand-ink">{formatMoney(summary.grand, currency)}</span>
      </div>
      {summary.taxRate > 0 && (
        <p className="text-[11px] text-brand-gray">
          {summary.pricesIncludeTax
            ? fill(t.taxIncl, { rate: summary.taxRate })
            : fill(t.taxExcl, { rate: summary.taxRate })}
        </p>
      )}
    </div>
  );
}
