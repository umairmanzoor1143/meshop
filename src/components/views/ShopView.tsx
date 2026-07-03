"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { ProductCard } from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { buildCategoryTree, categoryWithDescendants, productCounts } from "@/lib/categories";
import { catalogPrice, promotionApplies } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useShopData } from "@/context/ShopDataContext";
import { PageLoading, PageError } from "@/components/PageState";

type Sort = "featured" | "priceUp" | "priceDown" | "new";

export function ShopView({
  initialCat,
  initialQ,
  initialPromo,
}: {
  initialCat?: string;
  initialQ?: string;
  initialPromo?: boolean;
}) {
  const { t, tx } = useLocale();
  const { bundle, loading, error } = useShopData();
  const products = bundle?.products ?? [];
  const categories = bundle?.categories ?? [];
  const promotions = bundle?.promotions ?? [];
  const currency = bundle?.settings.pricingTaxSettings.currencies[0] ?? "CHF";

  const [cat, setCat] = useState<string | null>(initialCat ?? null);
  const [q, setQ] = useState(initialQ ?? "");
  const [promoOnly] = useState(!!initialPromo);
  const [sort, setSort] = useState<Sort>("featured");
  const sortLabels: Record<Sort, string> = {
    featured: t.sortPop,
    priceUp: t.sortPriceUp,
    priceDown: t.sortPriceDown,
    new: t.sortNew,
  };

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const counts = useMemo(() => productCounts(categories, products), [categories, products]);
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, tx(c.name)])), [categories, tx]);

  const visible = useMemo(() => {
    let list = products.slice();
    if (cat) {
      const ids = categoryWithDescendants(cat, categories);
      list = list.filter((p) => ids.has(p.categoryId));
    }
    if (promoOnly) list = list.filter((p) => promotions.some((pr) => promotionApplies(pr, p)));
    if (q.trim()) {
      const n = q.trim().toLowerCase();
      list = list.filter(
        (p) => tx(p.displayName).toLowerCase().includes(n) || tx(p.description).toLowerCase().includes(n)
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

  const Sidebar = (
    <nav aria-label={t.categories}>
      <p className="eyebrow text-brand-gray mb-4">{t.categories}</p>
      <ul className="space-y-1">
        <CatRow active={!cat && !promoOnly} label={t.allProducts} count={products.length} onClick={() => setCat(null)} />
        {tree.map((node) => (
          <li key={node.category.id}>
            <CatRow
              active={cat === node.category.id}
              label={tx(node.category.name)}
              count={counts[node.category.id]}
              onClick={() => setCat(node.category.id)}
            />
            {node.children.length > 0 && (
              <ul className="ml-3 mt-1 border-l border-border pl-3 space-y-0.5">
                {node.children.map((child) => (
                  <li key={child.category.id}>
                    <CatRow
                      small
                      active={cat === child.category.id}
                      label={tx(child.category.name)}
                      count={counts[child.category.id]}
                      onClick={() => setCat(child.category.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-6 border-t border-border">
        <p className="eyebrow text-brand-gray mb-3">{t.sortBy}</p>
        <ul className="space-y-1.5 text-sm text-brand-gray">
          {(
            [
              ["featured", t.sortPop],
              ["priceUp", t.sortPriceUp],
              ["priceDown", t.sortPriceDown],
              ["new", t.sortNew],
            ] as [Sort, string][]
          ).map(([key, label]) => (
            <li key={key}>
              <button
                onClick={() => setSort(key)}
                className={cn(
                  "transition-colors text-left",
                  sort === key ? "text-brand-ink font-medium" : "hover:text-brand-ink"
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );

  if (loading) return <PageLoading />;
  if (error || !bundle) return <PageError />;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Title */}
      <div className="mb-8 lg:mb-10">
        <p className="eyebrow text-brand-green mb-2">{t.shop}</p>
        <h1 className="font-serif text-4xl lg:text-5xl tracking-tight text-brand-ink font-normal">
          {cat ? catName.get(cat) : promoOnly ? t.promoTag : t.allProducts}
        </h1>
        <p className="text-sm text-brand-gray mt-2">
          {visible.length} {visible.length === 1 ? t.product : t.results}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-14">
        {/* Left sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">{Sidebar}</div>
        </aside>

        {/* Right content */}
        <div>
          {/* Mobile toolbar: filter sheet + sort */}
          <div className="flex lg:hidden items-stretch gap-3 mb-6">
            <Sheet>
              <SheetTrigger className="flex-1 inline-flex items-center justify-center gap-2 border border-brand-ink/20 rounded-md h-12 px-3.5 text-sm">
                <SlidersHorizontal width={16} /> {t.categories}
              </SheetTrigger>
              <SheetContent side="left" className="bg-brand-cream p-6 overflow-y-auto">
                <SheetTitle className="sr-only">{t.categories}</SheetTitle>
                {Sidebar}
              </SheetContent>
            </Sheet>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="flex-1 h-12 data-[size=default]:h-12 rounded-md border-brand-ink/20 px-3.5 text-sm">
                {sortLabels[sort]}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t.sortPop}</SelectItem>
                <SelectItem value="priceUp">{t.sortPriceUp}</SelectItem>
                <SelectItem value="priceDown">{t.sortPriceDown}</SelectItem>
                <SelectItem value="new">{t.sortNew}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visible.length === 0 ? (
            <p className="text-base text-brand-gray py-16">{t.noResults}</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {visible.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  promotions={promotions}
                  currency={currency}
                  eyebrow={catName.get(p.categoryId)}
                  priority={i < 3}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CatRow({
  active,
  label,
  count,
  onClick,
  small,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 transition-colors text-left",
        small ? "text-sm" : "text-[15px]",
        active ? "bg-brand-ink text-white" : "text-brand-ink/80 hover:bg-brand-tile"
      )}
    >
      <span className="truncate">{label}</span>
      {typeof count === "number" && (
        <span className={cn("text-xs tabular-nums", active ? "text-white/70" : "text-brand-gray")}>{count}</span>
      )}
    </button>
  );
}
