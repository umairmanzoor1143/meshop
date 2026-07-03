"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { buildCategoryTree, type CategoryNode } from "@/lib/categories";
import { getTenant } from "@/lib/theme";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useShopData } from "@/context/ShopDataContext";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import type { PublicShopCategory, Language, PublicShopBundle } from "@/lib/types";
import { cn } from "@/lib/utils";

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);

function anyPromotionActive(bundle: PublicShopBundle | null): boolean {
  if (!bundle) return false;
  const now = Date.now();
  return bundle.promotions.some(
    (p) =>
      p.isActive &&
      (!p.startDate || now >= new Date(p.startDate).getTime()) &&
      (!p.endDate || now <= new Date(p.endDate).getTime())
  );
}

export function Header() {
  const { bundle } = useShopData();
  const { count, ready } = useCart();
  const { t, tx } = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const categories = bundle?.categories ?? [];
  const languages = bundle?.settings.shopEnabledLanguages ?? (["DE", "EN"] as Language[]);
  const promoActive = anyPromotionActive(bundle);
  const tree = buildCategoryTree(categories);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
    setQ("");
  }

  const Logo = (
    <Link href="/" className="flex items-center gap-3" aria-label={tenant.name}>
      <span className="w-11 h-11 shrink-0 rounded-md bg-brand-ink text-brand-cream font-serif text-lg font-medium flex items-center justify-center tracking-tight">
        {tenant.mark}
      </span>
      <span className="leading-none">
        <span className="block font-serif text-xl lg:text-2xl font-medium tracking-tight text-brand-ink">
          {tenant.name}
        </span>
        <span className="hidden sm:block eyebrow text-brand-green mt-1">{tenant.tagline}</span>
      </span>
    </Link>
  );

  const CartButton = (
    <Link
      href="/cart"
      className="relative text-brand-ink hover:text-brand-green transition-colors"
      aria-label={t.cart}
    >
      <ShoppingBag width={22} strokeWidth={1.5} />
      {ready && count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-brand-ink rounded-full text-[10px] text-white flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <>
      <header>
      {/* Announcement bar (scrolls away) */}
      <div className="bg-brand-ink text-white text-[11px] sm:text-xs py-2.5 px-4 text-center tracking-wide font-normal whitespace-nowrap overflow-hidden">
        <span className="opacity-90">
          {tenant.tagline}
          <span className="hidden sm:inline"> · {tenant.contact.city}</span>
          <span className="mx-1.5 text-brand-gold">·</span>
          <span className="text-brand-gold">Abholung &amp; Lieferung</span>
        </span>
      </div>

      {/* Main row: logo LEFT, search + language + cart RIGHT (sticky on mobile only) */}
      <div className="sticky top-0 z-40 lg:static bg-brand-cream border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="lg:hidden text-brand-ink -ml-1" aria-label="Menu">
                <Menu width={24} strokeWidth={1.5} />
              </SheetTrigger>
              <SheetContent side="left" className="w-[88%] max-w-sm bg-brand-cream p-0">
                <SheetTitle className="sr-only">{tenant.name}</SheetTitle>
                <MobileMenu tree={tree} languages={languages} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            {Logo}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 lg:gap-5">
            <form
              onSubmit={submitSearch}
              className="hidden md:flex items-center gap-2.5 border border-brand-ink/15 rounded-full px-4 h-11 w-56 lg:w-72 hover:border-brand-ink/30 transition-colors"
            >
              <Search width={17} strokeWidth={1.5} className="text-brand-gray shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder={t.searchPh}
                className="bg-transparent text-sm placeholder:text-brand-gray focus:outline-none w-full"
              />
            </form>
            <LanguageSelect languages={languages} className="hidden lg:flex" />
            {CartButton}
          </div>
        </div>
      </div>
      </header>

      {/* Subheader nav: sibling of <header> so its containing block is <body> —
          this is what keeps ONLY the subheader pinned while the rest scrolls away. */}
      <nav className="hidden lg:block sticky top-0 z-50 bg-brand-cream border-b border-border">
        <ul className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-center gap-9 text-sm tracking-wide font-normal text-brand-ink whitespace-nowrap">
          <li>
            <Link href="/shop" className="hover:text-brand-green transition-colors uppercase">
              {t.allProducts}
            </Link>
          </li>
          {tree.map((node) => (
            <NavItem key={node.category.id} node={node} tx={tx} />
          ))}
          {promoActive && (
            <li>
              <Link
                href="/shop?promo=1"
                className="uppercase text-brand-gold hover:text-brand-green transition-colors font-medium"
              >
                {t.promoTag}
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}

function NavItem({ node, tx }: { node: CategoryNode; tx: (t: PublicShopCategory["name"]) => string }) {
  const hasChildren = node.children.length > 0;
  return (
    <li className="group relative">
      <Link
        href={`/shop?cat=${node.category.id}`}
        className="uppercase hover:text-brand-green transition-colors inline-flex items-center gap-1"
      >
        {tx(node.category.name)}
        {hasChildren && <ChevronDown width={13} className="opacity-50" />}
      </Link>
      {hasChildren && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <ul className="w-60 bg-card border border-border shadow-md rounded-md p-4 space-y-2.5 text-brand-gray text-sm normal-case tracking-normal">
            {node.children.map((child) => (
              <li key={child.category.id}>
                <Link
                  href={`/shop?cat=${child.category.id}`}
                  className="hover:text-brand-ink transition-colors block"
                >
                  {tx(child.category.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function MobileMenu({
  tree,
  languages,
  onNavigate,
}: {
  tree: CategoryNode[];
  languages: Language[];
  onNavigate: () => void;
}) {
  const { t, tx } = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onNavigate();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
    setQ("");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-6 h-20 border-b border-border">
        <span className="font-serif text-xl font-medium tracking-tight">{tenant.name}</span>
      </div>
      <form onSubmit={submit} className="flex items-center gap-2.5 px-6 py-4 border-b border-border">
        <Search width={18} className="text-brand-gray" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPh}
          className="bg-transparent text-base placeholder:text-brand-gray focus:outline-none w-full"
        />
      </form>
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        <ul className="space-y-1">
          <li>
            <Link href="/shop" onClick={onNavigate} className="block py-2.5 text-base uppercase tracking-wide">
              {t.allProducts}
            </Link>
          </li>
          {tree.map((node) => (
            <li key={node.category.id}>
              <Link
                href={`/shop?cat=${node.category.id}`}
                onClick={onNavigate}
                className="block py-2.5 text-base uppercase tracking-wide"
              >
                {tx(node.category.name)}
              </Link>
              {node.children.length > 0 && (
                <ul className="ml-3 mb-1 border-l border-border pl-4 space-y-1">
                  {node.children.map((child) => (
                    <li key={child.category.id}>
                      <Link
                        href={`/shop?cat=${child.category.id}`}
                        onClick={onNavigate}
                        className="block py-1.5 text-sm text-brand-gray"
                      >
                        {tx(child.category.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-6 py-4 border-t border-border">
        <LanguageSelect languages={languages} />
      </div>
    </div>
  );
}
