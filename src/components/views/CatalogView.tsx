"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryWithDescendants } from "@/lib/categories";
import { catalogPrice, effectiveAvailability, promotionApplies } from "@/lib/pricing";
import { productImageUrl } from "@/lib/image";
import { formatMoney } from "@/lib/format";
import { getTenant } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type {
  PublicShopBundle,
} from "@/lib/types";

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);
type Sort = "featured" | "priceUp" | "priceDown" | "new";

export function CatalogView({
  bundle,
  initialCat,
  initialQ,
  initialPromo,
}: {
  bundle: PublicShopBundle;
  initialCat?: string;
  initialQ?: string;
  initialPromo?: boolean;
}) {
  const { t, tx } = useLocale();
  const { products, categories, promotions, settings } = bundle;
  const currency = settings.pricingTaxSettings.currencies[0] ?? "CHF";

  const [cat, setCat] = useState<string | null>(initialCat ?? null);
  const [q, setQ] = useState(initialQ ?? "");
  const [promoOnly] = useState(!!initialPromo);
  const [sort, setSort] = useState<Sort>("featured");

  const topCategories = useMemo(
    () => categories.filter((c) => !c.parentCategoryId).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, tx(c.name)])), [categories, tx]);

  const heroImg = productImageUrl(products[0] ?? { imageKeys: [] });

  const visible = useMemo(() => {
    let list = products.slice();
    if (cat) {
      const ids = categoryWithDescendants(cat, categories);
      list = list.filter((p) => ids.has(p.categoryId));
    }
    if (promoOnly) {
      list = list.filter((p) => promotions.some((pr) => promotionApplies(pr, p)));
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          tx(p.displayName).toLowerCase().includes(needle) ||
          tx(p.description).toLowerCase().includes(needle)
      );
    }
    switch (sort) {
      case "priceUp":
        list.sort((a, b) => catalogPrice(a, promotions).price - catalogPrice(b, promotions).price);
        break;
      case "priceDown":
        list.sort((a, b) => catalogPrice(b, promotions).price - catalogPrice(a, promotions).price);
        break;
      case "new":
        list.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
        break;
      default:
        list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return list;
  }, [products, categories, promotions, cat, q, promoOnly, sort, tx]);

  const activePromo = promotions.find(
    (p) =>
      p.isActive &&
      (!p.startDate || Date.now() >= new Date(p.startDate).getTime()) &&
      (!p.endDate || Date.now() <= new Date(p.endDate).getTime())
  );

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="eyebrow text-brand-green mb-5">{t.heroKicker}</p>
            <h1 className="font-serif text-4xl lg:text-6xl leading-[1.02] tracking-tight text-brand-ink font-light mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-sm lg:text-base font-light text-brand-gray leading-relaxed max-w-md mb-8">
              {t.heroSub}
            </p>
            <div className="flex items-center gap-5">
              <Link
                href="#products"
                className="inline-flex items-center gap-2 bg-brand-ink text-white rounded-md px-7 py-3 text-xs tracking-widest uppercase font-medium hover:bg-brand-ink/90 transition-colors"
              >
                {t.shopNow}
                <ArrowRight width={15} />
              </Link>
              <span className="inline-flex items-center gap-2 text-xs text-brand-gray">
                <Sparkles width={14} className="text-brand-gold" />
                {t.heroLocal}
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] bg-brand-tile rounded-sm overflow-hidden">
              <ProductImage src={heroImg} alt={tenant.name} seed="hero" priority sizes="(max-width: 1024px) 100vw, 45vw" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden sm:block bg-card border border-border shadow-sm rounded-md px-5 py-4 max-w-[220px]">
              <p className="font-serif text-lg text-brand-ink leading-tight">{tenant.name}</p>
              <p className="text-[11px] text-brand-gray mt-1">{tenant.contact.city}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active promotion strip */}
      {activePromo && (
        <section className="bg-brand-ink text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-3 text-center">
            <span className="eyebrow text-brand-gold">{t.promoTag}</span>
            <span className="text-xs font-light">
              {activePromo.discountType === "PERCENTAGE"
                ? `−${activePromo.discountValue}%`
                : `−${formatMoney(activePromo.discountValue, currency)}`}{" "}
              {t.promoOn}{" "}
              {activePromo.scope === "SHOP_WIDE"
                ? t.promoShopWide
                : activePromo.categoryIds?.map((id) => catName.get(id)).filter(Boolean).join(", ")}
            </span>
          </div>
        </section>
      )}

      {/* Catalog */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-serif text-3xl tracking-tight text-brand-ink font-light">
              {cat ? catName.get(cat) : t.allProducts}
            </h2>
            <p className="text-xs text-brand-gray mt-1">
              {visible.length} {visible.length === 1 ? t.product : t.results}
            </p>
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-52 text-xs">
              <SelectValue placeholder={t.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">{t.sortPop}</SelectItem>
              <SelectItem value="priceUp">{t.sortPriceUp}</SelectItem>
              <SelectItem value="priceDown">{t.sortPriceDown}</SelectItem>
              <SelectItem value="new">{t.sortNew}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Chip active={!cat} onClick={() => setCat(null)}>
            {t.allProducts}
          </Chip>
          {topCategories.map((c) => (
            <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {tx(c.name)}
            </Chip>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-brand-gray py-16 text-center">{t.noResults}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {visible.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                promotions={promotions}
                currency={currency}
                eyebrow={catName.get(p.categoryId)}
                priority={i < 4}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-xs tracking-wide border transition-colors",
        active
          ? "bg-brand-ink text-white border-brand-ink"
          : "bg-transparent text-brand-ink/80 border-brand-ink/15 hover:border-brand-ink/50"
      )}
    >
      {children}
    </button>
  );
}
