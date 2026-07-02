"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, User, ShoppingBag, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { buildCategoryTree, type CategoryNode } from "@/lib/categories";
import { getTenant } from "@/lib/theme";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import type { PublicShopCategory, Language } from "@/lib/types";
import { cn } from "@/lib/utils";

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);

export function Header({
  categories,
  languages,
  promoActive = false,
}: {
  categories: PublicShopCategory[];
  languages: Language[];
  promoActive?: boolean;
}) {
  const { count, ready } = useCart();
  const { t, tx } = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const tree = buildCategoryTree(categories);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement bar */}
      <div className="bg-brand-ink text-white text-[11px] py-2 text-center tracking-wide font-light">
        <span className="opacity-90">
          {tenant.tagline} · {tenant.contact.city}
          <span className="mx-2 text-brand-gold">·</span>
          <span className="text-brand-gold">Abholung &amp; Lieferung</span>
        </span>
      </div>

      {/* Main bar */}
      <div className="glass-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: mobile menu + desktop search */}
          <div className="flex items-center gap-2 lg:w-1/4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="lg:hidden text-brand-ink"
                aria-label="Menu"
              >
                <Menu width={20} strokeWidth={1.5} />
              </SheetTrigger>
              <SheetContent side="left" className="w-[86%] max-w-sm bg-brand-cream p-0">
                <SheetTitle className="sr-only">{tenant.name}</SheetTitle>
                <MobileMenu
                  tree={tree}
                  languages={languages}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <form onSubmit={submitSearch} className="hidden lg:flex items-center gap-2 w-full">
              <Search width={17} strokeWidth={1.5} className="text-brand-gray shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder={t.searchPh}
                className="bg-transparent text-xs placeholder:text-brand-gray focus:outline-none w-full font-light"
              />
            </form>
          </div>

          {/* Center: wordmark */}
          <Link
            href="/"
            className="serif text-center w-full lg:w-auto leading-none"
            aria-label={tenant.name}
          >
            <span className="block text-xl lg:text-2xl font-serif font-medium tracking-tight text-brand-ink">
              Marktplatz&nbsp;Küssnacht
            </span>
            <span className="hidden lg:block eyebrow text-brand-green mt-0.5">
              {tenant.tagline}
            </span>
          </Link>

          {/* Right: language, account, cart */}
          <div className="flex items-center justify-end gap-4 lg:w-1/4">
            <LanguageSwitcher languages={languages} className="hidden lg:flex" />
            <Link href="/account" className="hidden lg:block text-brand-ink hover:text-brand-green transition-colors" aria-label={t.account}>
              <User width={18} strokeWidth={1.5} />
            </Link>
            <Link href="/cart" className="relative text-brand-ink hover:text-brand-green transition-colors" aria-label={t.cart}>
              <ShoppingBag width={19} strokeWidth={1.5} />
              {ready && count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-brand-ink rounded-full text-[9px] text-white flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop category nav */}
        <nav className="hidden lg:flex justify-center border-t border-border/70 py-3">
          <ul className="flex gap-8 text-[11px] tracking-widest font-normal text-brand-ink/80">
            <li>
              <Link href="/" className="hover:text-brand-green transition-colors uppercase">
                {t.allProducts}
              </Link>
            </li>
            {tree.map((node) => (
              <NavItem key={node.category.id} node={node} tx={tx} />
            ))}
            {promoActive && (
              <li>
                <Link
                  href="/?promo=1"
                  className="uppercase text-brand-gold hover:text-brand-green transition-colors font-medium"
                >
                  {t.promoTag}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function NavItem({ node, tx }: { node: CategoryNode; tx: (t: PublicShopCategory["name"]) => string }) {
  const hasChildren = node.children.length > 0;
  return (
    <li className="group relative">
      <Link
        href={`/?cat=${node.category.id}`}
        className="uppercase hover:text-brand-green transition-colors inline-flex items-center gap-1"
      >
        {tx(node.category.name)}
        {hasChildren && <ChevronDown width={11} className="opacity-50" />}
      </Link>
      {hasChildren && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <ul className="w-52 bg-card border border-border shadow-sm p-4 space-y-2 text-brand-gray text-[11px] normal-case tracking-normal">
            {node.children.map((child) => (
              <li key={child.category.id}>
                <Link href={`/?cat=${child.category.id}`} className="hover:text-brand-ink transition-colors block">
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
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-16 border-b border-border">
        <span className="font-serif text-lg font-medium tracking-tight">Marktplatz Küssnacht</span>
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Search width={16} className="text-brand-gray" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPh}
          className="bg-transparent text-sm placeholder:text-brand-gray focus:outline-none w-full font-light"
        />
      </form>
      <nav className="flex-1 overflow-y-auto px-5 py-4">
        <ul className="space-y-1">
          <li>
            <Link href="/" onClick={onNavigate} className="block py-2 text-sm uppercase tracking-wider">
              {t.allProducts}
            </Link>
          </li>
          {tree.map((node) => (
            <li key={node.category.id}>
              <Link
                href={`/?cat=${node.category.id}`}
                onClick={onNavigate}
                className="block py-2 text-sm uppercase tracking-wider"
              >
                {tx(node.category.name)}
              </Link>
              {node.children.length > 0 && (
                <ul className="ml-3 mb-1 border-l border-border pl-3 space-y-1">
                  {node.children.map((child) => (
                    <li key={child.category.id}>
                      <Link
                        href={`/?cat=${child.category.id}`}
                        onClick={onNavigate}
                        className="block py-1 text-[13px] text-brand-gray"
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
      <div className="px-5 py-4 border-t border-border flex items-center justify-between">
        <LanguageSwitcher languages={languages} />
        <Link href="/account" onClick={onNavigate} className="text-brand-gray inline-flex items-center gap-2 text-xs">
          <User width={15} /> {t.account}
        </Link>
      </div>
    </div>
  );
}
