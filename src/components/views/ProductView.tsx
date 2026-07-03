"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Heart, Leaf, Store, ShieldCheck, Check } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import {
  defaultVariation,
  variationEffectivePrice,
  unitPrice,
  hasOwnSale,
  bestPromotion,
  effectiveAvailability,
} from "@/lib/pricing";
import { imageUrl } from "@/lib/image";
import { formatMoney, fill } from "@/lib/format";
import { getTenant } from "@/lib/theme";
import { PriceTag } from "@/components/PriceTag";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useShopData } from "@/context/ShopDataContext";
import { fetchProduct } from "@/lib/clientShop";
import { PageLoading, PageError } from "@/components/PageState";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type {
  Currency,
  FulfillmentMode,
  PublicShopCategory,
  PublicShopProduct,
  PublicShopPromotion,
  PublicShopSettings,
} from "@/lib/types";

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);

const microcopy = {
  de: { availableUntil: "Verfügbar bis {date}", from: "ab", included: "inkl." },
  en: { availableUntil: "Available until {date}", from: "from", included: "incl." },
} as const;

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
}

export function ProductView({ id }: { id: string }) {
  const { bundle, loading: bundleLoading, error: bundleError } = useShopData();
  const [product, setProduct] = useState<PublicShopProduct | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");

  // Client fetch → /api/shop/products/[id] is visible in the Network tab.
  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetchProduct(id)
      .then((p) => {
        if (!alive) return;
        if (p) {
          setProduct(p);
          setStatus("ok");
        } else {
          setStatus("notfound");
        }
      })
      .catch(() => {
        if (alive) setStatus("notfound");
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (status === "loading" || bundleLoading) return <PageLoading />;
  if (status === "notfound" || !product) return <PageError message="Produkt nicht gefunden" />;
  if (bundleError || !bundle) return <PageError />;

  return (
    <ProductDetail
      product={product}
      settings={bundle.settings}
      promotions={bundle.promotions}
      categories={bundle.categories}
      related={bundle.products.filter((p) => p.id !== product.id)}
    />
  );
}

function ProductDetail({
  product,
  settings,
  promotions,
  categories,
  related,
}: {
  product: PublicShopProduct;
  settings?: PublicShopSettings;
  promotions: PublicShopPromotion[];
  categories: PublicShopCategory[];
  related: PublicShopProduct[];
}) {
  const { add } = useCart();
  const { t, tx, locale } = useLocale();
  const mc = microcopy[locale === "en" ? "en" : "de"];

  const currency: Currency = settings?.pricingTaxSettings.currencies[0] ?? "CHF";
  const pricesIncludeTax = settings?.pricingTaxSettings.pricesIncludeTax ?? false;
  // Display the shop's effective tax rate (its default tax choice), so PDP and
  // cart agree. Falls back to the product's own rate only when settings are absent.
  const taxRates = settings?.pricingTaxSettings.taxRates ?? [];
  const taxRate = taxRates.find((r) => r.isDefault)?.rate ?? taxRates[0]?.rate ?? product.taxRate ?? 0;

  const activeVariations = product.variations.filter((v) => v.isActive);
  const [variationId, setVariationId] = useState(defaultVariation(product)?.id);
  const activeExtras = useMemo(
    () => product.extras.filter((g) => g.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [product.extras]
  );

  // Extras selection keyed by group. Required SINGLE groups default to first choice.
  const [extrasByGroup, setExtrasByGroup] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const g of product.extras) {
      if (g.required && g.selectionType === "SINGLE" && g.choices[0]) init[g.id] = [g.choices[0].id];
      else init[g.id] = [];
    }
    return init;
  });
  const [qty, setQty] = useState(1);

  const flatExtras = useMemo(() => Object.values(extrasByGroup).flat(), [extrasByGroup]);

  const availability = effectiveAvailability(product);
  const unavailable = availability === "UNAVAILABLE";

  // Pricing: configured unit (variation eff price + extras), with store promotion overlaid.
  const unit = unitPrice(product, variationId, flatExtras);
  const onOwnSale = hasOwnSale(product, variationId);
  const promo = onOwnSale ? null : bestPromotion(product, unit, promotions);
  const unitNet = Math.max(0, unit - (promo?.discount ?? 0));
  const discountPct = unit > 0 && unitNet < unit ? Math.round((1 - unitNet / unit) * 100) : 0;
  const lineTotal = unitNet * qty;

  const images = product.imageKeys
    .map((k) => imageUrl(k.key))
    .filter((u): u is string => !!u);
  const [mainIdx, setMainIdx] = useState(0);
  const mainImg = images[mainIdx] ?? null;

  const category = categories.find((c) => c.id === product.categoryId);
  const relatedSame = related
    .filter((p) => p.categoryId === product.categoryId)
    .concat(related.filter((p) => p.categoryId !== product.categoryId))
    .slice(0, 4);

  const fulfillmentLabel = (m: FulfillmentMode) =>
    m === "DELIVERY" ? t.delivery : m === "PICKUP" ? t.pickup : m === "DIGITAL" ? t.digital : t.reservation;

  function addToCart() {
    if (unavailable) return;
    // Enforce required groups have a selection.
    for (const g of activeExtras) {
      if (g.required && (extrasByGroup[g.id]?.length ?? 0) === 0) {
        toast.error(`${tx(g.displayName)}: ${t.required}`);
        return;
      }
    }
    add({ productId: product.id, variationId, extraChoiceIds: flatExtras, qty });
    toast.success(t.addToCart, { description: tx(product.displayName) });
  }

  function selectSingle(groupId: string, choiceId: string) {
    setExtrasByGroup((prev) => ({ ...prev, [groupId]: [choiceId] }));
  }
  function toggleMulti(groupId: string, choiceId: string) {
    setExtrasByGroup((prev) => {
      const cur = new Set(prev[groupId] ?? []);
      cur.has(choiceId) ? cur.delete(choiceId) : cur.add(choiceId);
      return { ...prev, [groupId]: [...cur] };
    });
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-brand-gray mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-brand-ink shrink-0">
            {t.home}
          </Link>
          {category && (
            <>
              <ChevronRight width={11} className="shrink-0" />
              <Link href={`/shop?cat=${category.id}`} className="hover:text-brand-ink shrink-0">
                {tx(category.name)}
              </Link>
            </>
          )}
          <ChevronRight width={11} className="shrink-0" />
          <span className="text-brand-ink shrink-0">{tx(product.displayName)}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24 h-fit">
            <div className="relative w-full aspect-[4/5] bg-card border border-border overflow-hidden rounded-lg">
              <ProductImage
                src={mainImg}
                alt={tx(product.displayName)}
                seed={product.id}
                priority
                fit="contain"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              {availability === "LIMITED" && (
                <span className="absolute top-4 left-4 bg-card/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-medium tracking-wide text-brand-gold">
                  {t.limited}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setMainIdx(i)}
                    className={cn(
                      "relative aspect-square bg-card rounded-md overflow-hidden border-2 transition-all",
                      i === mainIdx ? "border-brand-ink" : "border-border hover:border-brand-gray/50"
                    )}
                    aria-label={`${tx(product.displayName)} ${i + 1}`}
                  >
                    <ProductImage src={src} alt="" seed={`${product.id}-${i}`} fit="contain" sizes="10vw" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="border-b border-brand-ink/10 pb-6 mb-6">
              {category && <p className="eyebrow text-brand-green mb-3">{tx(category.name)}</p>}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-5xl tracking-tight text-brand-ink font-normal mb-3 sm:mb-4 leading-tight">
                {tx(product.displayName)}
              </h1>
              <PriceTag size="lg" price={unitNet} currency={currency} />
              {taxRate > 0 && (
                <p className="text-[11px] text-brand-gray mt-1">
                  {pricesIncludeTax ? fill(t.taxIncl, { rate: taxRate }) : fill(t.taxExcl, { rate: taxRate })}
                </p>
              )}
              {tx(product.description) && (
                <p className="mt-4 text-sm sm:text-base font-normal text-brand-gray leading-relaxed whitespace-pre-line line-clamp-4">
                  {tx(product.description)}
                </p>
              )}
            </div>

            {/* Variation selector (shown when there is a real choice) */}
            {activeVariations.length > 1 && (
              <div className="mb-6">
                <span className="eyebrow text-brand-ink mb-3 block">{t.variation}</span>
                <div className="flex flex-wrap gap-3">
                  {activeVariations.map((v) => {
                    const eff = variationEffectivePrice(v);
                    const selected = v.id === variationId;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setVariationId(v.id)}
                        className={cn(
                          "px-5 py-3 border rounded-md text-sm transition-all",
                          selected
                            ? "border-brand-ink bg-brand-ink/[0.04]"
                            : "border-brand-ink/20 hover:border-brand-ink/60"
                        )}
                      >
                        {tx(v.displayName)}
                        <span className="text-brand-gray ml-1.5">{formatMoney(eff.price, currency)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extras (required stall category etc.) */}
            {activeExtras.map((group) => (
              <div key={group.id} className="mb-6">
                <span className="eyebrow text-brand-ink mb-3 flex items-center gap-2">
                  {tx(group.displayName)}
                  {group.required && (
                    <span className="text-brand-gray normal-case tracking-normal text-[10px]">
                      · {t.required}
                    </span>
                  )}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {group.choices
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((choice) => {
                      const selected = (extrasByGroup[group.id] ?? []).includes(choice.id);
                      return (
                        <button
                          key={choice.id}
                          onClick={() =>
                            group.selectionType === "SINGLE"
                              ? selectSingle(group.id, choice.id)
                              : toggleMulti(group.id, choice.id)
                          }
                          className={cn(
                            "px-4 py-3 border rounded-md text-sm transition-all inline-flex items-center gap-2",
                            selected
                              ? "border-brand-ink bg-brand-ink/[0.04]"
                              : "border-brand-ink/20 hover:border-brand-ink/60"
                          )}
                        >
                          {selected && group.selectionType === "MULTIPLE" && (
                            <Check width={13} className="text-brand-green" />
                          )}
                          <span>{tx(choice.displayName)}</span>
                          {choice.priceModifier !== 0 && (
                            <span className="text-brand-gray">
                              {choice.priceModifier > 0 ? "+" : ""}
                              {formatMoney(choice.priceModifier, currency)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Quantity + add to cart */}
            <div className="flex gap-3 mb-5">
              <QuantityStepper value={qty} onChange={setQty} className="h-14 w-32" />
              <button
                onClick={addToCart}
                disabled={unavailable}
                className="flex-1 bg-brand-ink text-white hover:bg-brand-green transition-all rounded-md h-14 text-sm tracking-widest uppercase font-medium flex items-center justify-center gap-2.5 disabled:opacity-40"
              >
                <span>{unavailable ? t.soldOut : t.addToCart}</span>
                {!unavailable && (
                  <>
                    <span className="w-1 h-1 bg-white/70 rounded-full" />
                    <span>{formatMoney(lineTotal, currency)}</span>
                  </>
                )}
              </button>
              <button
                aria-label="Wishlist"
                className="w-14 h-14 shrink-0 flex items-center justify-center border border-brand-ink/20 rounded-md hover:border-brand-ink transition-colors"
              >
                <Heart width={19} />
              </button>
            </div>

            {/* Truthful availability window (real reservation deadline) */}
            {availability !== "UNLIMITED" && product.availability.availableTo && (
              <div className="flex items-center gap-2.5 bg-brand-tile/60 p-3 rounded-md mb-8 border border-border">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold" />
                </span>
                <span className="text-[11px] font-medium text-brand-ink/80">
                  {fill(mc.availableUntil, { date: fmtDate(product.availability.availableTo) })}
                </span>
              </div>
            )}

            {/* Accordions */}
            <Accordion multiple={false} defaultValue={["desc"]} className="border-t border-brand-ink/10">
              <AccordionItem value="desc" className="border-b border-brand-ink/10">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-wide hover:no-underline py-5">
                  {t.description}
                </AccordionTrigger>
                <AccordionContent className="text-sm font-normal text-brand-gray leading-relaxed whitespace-pre-line pb-4">
                  {tx(product.description) || "—"}
                </AccordionContent>
              </AccordionItem>

              {(tx(product.additionalInfo) || tx(product.disclaimer)) && (
                <AccordionItem value="info" className="border-b border-brand-ink/10">
                  <AccordionTrigger className="text-sm font-medium uppercase tracking-wide hover:no-underline py-5">
                    {t.info}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm font-normal text-brand-gray leading-relaxed whitespace-pre-line pb-4 space-y-2">
                    {tx(product.additionalInfo) && <p>{tx(product.additionalInfo)}</p>}
                    {tx(product.disclaimer) && <p className="text-brand-gray/80">{tx(product.disclaimer)}</p>}
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="ship" className="border-b border-brand-ink/10">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-wide hover:no-underline py-5">
                  {t.deliveryTerms}
                </AccordionTrigger>
                <AccordionContent className="text-sm font-normal text-brand-gray leading-relaxed pb-4 space-y-2">
                  {product.fulfillmentModes && product.fulfillmentModes.length > 0 && (
                    <p className="flex flex-wrap gap-2">
                      {product.fulfillmentModes.map((m) => (
                        <span key={m} className="inline-flex items-center gap-1.5 text-xs border border-border rounded-full px-3 py-1">
                          <Check width={12} className="text-brand-green" />
                          {fulfillmentLabel(m)}
                        </span>
                      ))}
                    </p>
                  )}
                  {settings?.orderManagementSettings.deliveryPrices && (
                    <p>
                      {t.delivery}: {mc.from} {formatMoney(settings.orderManagementSettings.deliveryPrices.standard, currency)}
                    </p>
                  )}
                  <p>{t.pickupInfo}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Trust badges (truthful for a local cooperative) */}
            <div className="grid grid-cols-3 gap-3 mt-10 pt-4">
              {[
                { icon: Leaf, label: locale === "en" ? "Local & regional" : "Lokal & regional" },
                { icon: Store, label: locale === "en" ? "Cooperative" : "Genossenschaft" },
                { icon: ShieldCheck, label: locale === "en" ? "Secure payment" : "Sichere Zahlung" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center justify-center text-center gap-2.5">
                  <Icon width={24} className="text-brand-green" strokeWidth={1.4} />
                  <span className="text-xs uppercase tracking-wide text-brand-gray">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell */}
      {relatedSame.length > 0 && (
        <section className="border-t border-brand-ink/5 bg-card py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-serif text-2xl lg:text-3xl tracking-tight text-brand-ink font-normal">
                {t.recommended}
              </h2>
              <Link
                href="/"
                className="text-xs font-medium underline underline-offset-4 decoration-brand-ink/30 hover:decoration-brand-ink transition-all"
              >
                {t.viewAll}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {relatedSame.map((p) => {
                const c = categories.find((cat) => cat.id === p.categoryId);
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    promotions={promotions}
                    currency={currency}
                    eyebrow={c ? tx(c.name) : undefined}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
