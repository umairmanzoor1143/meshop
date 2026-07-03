"use client";

import Link from "next/link";
import { MoveRight, MountainSnow, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useShopData } from "@/context/ShopDataContext";
import { ProductCard } from "@/components/ProductCard";
import { PageLoading, PageError } from "@/components/PageState";
import { getTenant } from "@/lib/theme";

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);

export function HomeView() {
  const { t, tx } = useLocale();
  const { bundle, loading, error } = useShopData();

  if (loading) return <PageLoading />;
  if (error || !bundle) return <PageError />;

  const { products, categories, promotions, settings } = bundle;
  const currency = settings.pricingTaxSettings.currencies[0] ?? "CHF";
  const featured = products
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4);

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-brand-cream border-b border-border">
        <RigiSilhouette />

        <div className="relative max-w-5xl mx-auto px-6 flex flex-col items-center text-center py-12 sm:py-16 lg:py-27">
          <p className="eyebrow text-brand-green mb-6 flex items-center gap-2">
            <MountainSnow width={16} /> {t.heroKicker}
          </p>

          <h1 className="font-serif font-normal text-brand-ink tracking-tight leading-[1.0] text-4xl sm:text-6xl lg:text-7xl max-w-4xl">
            {t.heroTitle}
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-brand-gray leading-relaxed max-w-xl">
            {t.heroSub}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 bg-brand-ink text-white rounded-full px-9 py-4 text-sm tracking-widest uppercase font-medium hover:bg-brand-green transition-colors"
            >
              {t.shopNow}
              <MoveRight width={17} />
            </Link>
            <Link
              href="/shop?promo=1"
              className="inline-flex items-center gap-2 text-sm tracking-wide text-brand-ink border-b border-brand-ink/30 pb-0.5 hover:border-brand-ink transition-colors"
            >
              {t.promoTag} · −10%
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-8 sm:gap-12 text-center">
            {[
              ["90+", t.heroLocal],
              ["1997", tenant.short],
              [`${products.length}`, t.results],
            ].map(([big, small], i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-serif text-3xl lg:text-4xl text-brand-ink">
                  {big}
                </span>
                <span className="text-xs uppercase tracking-wider text-brand-gray mt-1">
                  {small}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex items-end justify-between mb-10 lg:mb-12">
            <div>
              <p className="eyebrow text-brand-green mb-2">{t.featured}</p>
              <h2 className="font-serif text-3xl lg:text-4xl tracking-tight text-brand-ink font-normal">
                {t.allProducts}
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 decoration-brand-ink/30 hover:decoration-brand-ink transition-all whitespace-nowrap"
            >
              {t.viewAll} <ArrowRight width={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {featured.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                promotions={promotions}
                currency={currency}
                eyebrow={tx(
                  categories.find((c) => c.id === p.categoryId)?.name,
                )}
                priority={i < 4}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** Layered Rigi mountain silhouette anchored to the bottom of the hero. */
function RigiSilhouette() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-full"
      >
        <path
          d="M0,240 L180,150 L340,220 L520,120 L700,210 L880,110 L1060,200 L1240,140 L1440,210 L1440,320 L0,320 Z"
          fill="var(--brand-green)"
          opacity="0.05"
        />
        <path
          d="M0,280 L200,200 L380,260 L560,180 L760,255 L960,175 L1160,250 L1360,200 L1440,240 L1440,320 L0,320 Z"
          fill="var(--brand-green)"
          opacity="0.08"
        />
        <path
          d="M0,310 L240,255 L460,300 L680,245 L900,300 L1120,255 L1340,300 L1440,275 L1440,320 L0,320 Z"
          fill="var(--brand-green)"
          opacity="0.12"
        />
      </svg>
    </div>
  );
}
