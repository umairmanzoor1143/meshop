"use client";

import Link from "next/link";
import { X, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartLines } from "@/context/useCartLines";
import { useLocale } from "@/context/LocaleContext";
import { computeCart } from "@/lib/pricing";
import { describeLineConfig } from "@/lib/lineLabel";
import { productImageUrl } from "@/lib/image";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SummaryLines } from "@/components/SummaryLines";
import type { FulfillmentMode, PublicShopBundle } from "@/lib/types";

// Cart preview uses a no-shipping fulfillment mode; delivery cost is chosen at checkout.
function previewMode(methods: FulfillmentMode[] | undefined): FulfillmentMode {
  const m = methods ?? [];
  return m.includes("PICKUP") ? "PICKUP" : m.includes("RESERVATION") ? "RESERVATION" : m[0] ?? "PICKUP";
}

export function CartView({ bundle }: { bundle: PublicShopBundle }) {
  const { products, settings, promotions } = bundle;
  const { t, tx } = useLocale();
  const { setQty, remove } = useCart();
  const lines = useCartLines(products);
  const currency = settings.pricingTaxSettings.currencies[0] ?? "CHF";

  if (lines.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center flex flex-col items-center">
        <ShoppingBag width={30} strokeWidth={1.2} className="text-brand-gray mb-5" />
        <h1 className="font-serif text-3xl text-brand-ink mb-3">{t.emptyCart}</h1>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 bg-brand-ink text-white rounded-md px-7 py-3 text-xs tracking-widest uppercase font-medium hover:bg-brand-ink/90 transition-colors"
        >
          {t.continueShopping}
          <ArrowRight width={15} />
        </Link>
      </section>
    );
  }

  const summary = computeCart(lines, settings, promotions, { fulfillment: previewMode(settings.orderManagementSettings.fulfillmentMethods) });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-brand-ink font-light mb-10">
        {t.cartTitle}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        {/* Line items */}
        <div className="lg:col-span-2">
          <div className="border-t border-brand-ink/10">
            {summary.lines.map((line) => {
              const name = tx(line.product.displayName);
              const config = describeLineConfig(line.product, line.variationId, line.extraChoiceIds, tx);
              return (
                <div key={line.key} className="flex gap-4 py-6 border-b border-brand-ink/10">
                  <Link
                    href={`/product/${line.product.id}`}
                    className="relative w-20 sm:w-24 aspect-[3/4] bg-brand-tile rounded-sm overflow-hidden shrink-0"
                  >
                    <ProductImage src={productImageUrl(line.product)} alt={name} seed={line.product.id} sizes="100px" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/product/${line.product.id}`}>
                        <h3 className="font-serif text-base text-brand-ink leading-snug hover:text-brand-green transition-colors">
                          {name}
                        </h3>
                      </Link>
                      <button
                        onClick={() => remove(line.key)}
                        aria-label={t.remove}
                        className="text-brand-gray hover:text-brand-ink transition-colors shrink-0"
                      >
                        <X width={16} />
                      </button>
                    </div>
                    {config.length > 0 && (
                      <p className="text-[11px] text-brand-gray mt-1">{config.join(" · ")}</p>
                    )}
                    <p className="text-[11px] text-brand-gray mt-0.5">
                      {formatMoney(line.unit, currency)} / {t.unit}
                    </p>
                    <div className="flex items-end justify-between mt-3">
                      <QuantityStepper
                        value={line.qty}
                        onChange={(n) => setQty(line.key, n)}
                        className="h-9 w-24"
                      />
                      <div className="text-right">
                        {line.discount > 0 && (
                          <span className="block text-[11px] text-brand-gray line-through">
                            {formatMoney(line.lineTotal, currency)}
                          </span>
                        )}
                        <span className="text-sm font-light text-brand-ink">
                          {formatMoney(line.lineTotal - line.discount, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 text-xs text-brand-gray hover:text-brand-ink transition-colors"
          >
            ← {t.continueShopping}
          </Link>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <div className="bg-card border border-border rounded-md p-6 lg:sticky lg:top-28">
            <h2 className="eyebrow text-brand-ink mb-5">{t.grand}</h2>
            <SummaryLines summary={summary} currency={currency} showShipping={false} />
            <p className="text-[11px] text-brand-gray mt-3">{t.shipping}: {t.checkout} →</p>
            <Link
              href="/checkout"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-brand-ink text-white rounded-md h-12 text-xs tracking-widest uppercase font-medium hover:bg-brand-ink/90 transition-colors"
            >
              {t.checkout}
              <ArrowRight width={15} />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
