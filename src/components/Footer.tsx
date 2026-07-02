"use client";

import Link from "next/link";
import { CreditCard, Wallet, MapPin, Mail } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons";
import { useLocale } from "@/context/LocaleContext";
import { buildCategoryTree } from "@/lib/categories";
import { getTenant } from "@/lib/theme";
import type { PublicShopCategory } from "@/lib/types";

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);

export function Footer({
  categories,
  termsUrl,
}: {
  categories: PublicShopCategory[];
  termsUrl?: string;
}) {
  const { t, tx } = useLocale();
  const tops = buildCategoryTree(categories).slice(0, 4);
  const year = 2026;

  return (
    <footer className="bg-brand-ink text-white pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-14">
        <div>
          <Link href="/" className="text-xl font-serif tracking-tight font-medium block mb-4">
            {tenant.name}
          </Link>
          <p className="text-xs text-white/60 font-light leading-relaxed mb-6">{t.footerAbout}</p>
          <div className="space-y-1.5 text-xs text-white/60 font-light">
            <p className="flex items-center gap-2">
              <MapPin width={13} className="shrink-0" />
              {tenant.contact.street}, {tenant.contact.zip} {tenant.contact.city}
            </p>
            <p className="flex items-center gap-2">
              <Mail width={13} className="shrink-0" />
              {tenant.contact.email}
            </p>
          </div>
          <div className="flex gap-4 mt-5">
            <a href="#" aria-label="Instagram" className="text-white/60 hover:text-white transition-colors">
              <InstagramIcon width={18} />
            </a>
            <a href="#" aria-label="Facebook" className="text-white/60 hover:text-white transition-colors">
              <FacebookIcon width={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="eyebrow text-white mb-6">{t.shop}</h4>
          <ul className="space-y-3 text-xs font-light text-white/60">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                {t.allProducts}
              </Link>
            </li>
            {tops.map((n) => (
              <li key={n.category.id}>
                <Link href={`/?cat=${n.category.id}`} className="hover:text-white transition-colors">
                  {tx(n.category.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-white mb-6">{t.contactInfo}</h4>
          <ul className="space-y-3 text-xs font-light text-white/60">
            <li><Link href="/account" className="hover:text-white transition-colors">{t.myAccount}</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">{t.cart}</Link></li>
            <li><a href={`mailto:${tenant.contact.email}`} className="hover:text-white transition-colors">{t.contact}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-white mb-6">Legal</h4>
          <ul className="space-y-3 text-xs font-light text-white/60">
            <li>
              <a
                href={termsUrl || "#"}
                target={termsUrl ? "_blank" : undefined}
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                {t.footerTerms}
              </a>
            </li>
            <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-white/40 font-light">
          © {year} {tenant.name}. Alle Rechte vorbehalten.
        </p>
        <div className="flex gap-3 opacity-40">
          <CreditCard width={20} />
          <Wallet width={20} />
        </div>
      </div>
    </footer>
  );
}
