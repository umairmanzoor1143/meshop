"use client";

import Link from "next/link";
import { CreditCard, Wallet, MapPin, Mail } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons";
import { useLocale } from "@/context/LocaleContext";
import { useShopData } from "@/context/ShopDataContext";
import { buildCategoryTree } from "@/lib/categories";
import { getTenant } from "@/lib/theme";

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);

export function Footer() {
  const { t, tx } = useLocale();
  const { bundle } = useShopData();
  const tops = buildCategoryTree(bundle?.categories ?? []).slice(0, 4);
  const termsUrl = bundle?.settings.termsUrl;
  const year = 2026;

  return (
    <footer className="bg-brand-ink text-white pt-20 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-10 mb-16">
        <div>
          <Link href="/" className="text-2xl font-serif tracking-tight font-medium block mb-4">
            {tenant.name}
          </Link>
          <p className="text-sm text-white/75 leading-relaxed mb-6 max-w-xs">{t.footerAbout}</p>
          <div className="space-y-2 text-sm text-white/75">
            <p className="flex items-center gap-2.5">
              <MapPin width={15} className="shrink-0" />
              {tenant.contact.street}, {tenant.contact.zip} {tenant.contact.city}
            </p>
            <p className="flex items-center gap-2.5">
              <Mail width={15} className="shrink-0" />
              {tenant.contact.email}
            </p>
          </div>
          <div className="flex gap-4 mt-6">
            <a href="#" aria-label="Instagram" className="text-white/70 hover:text-white transition-colors">
              <InstagramIcon width={20} />
            </a>
            <a href="#" aria-label="Facebook" className="text-white/70 hover:text-white transition-colors">
              <FacebookIcon width={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="eyebrow text-white mb-6">{t.shop}</h4>
          <ul className="space-y-3 text-sm text-white/75">
            <li>
              <Link href="/shop" className="hover:text-white transition-colors">
                {t.allProducts}
              </Link>
            </li>
            {tops.map((n) => (
              <li key={n.category.id}>
                <Link href={`/shop?cat=${n.category.id}`} className="hover:text-white transition-colors">
                  {tx(n.category.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-white mb-6">{t.contactInfo}</h4>
          <ul className="space-y-3 text-sm text-white/75">
            <li><Link href="/cart" className="hover:text-white transition-colors">{t.cart}</Link></li>
            <li><a href={`mailto:${tenant.contact.email}`} className="hover:text-white transition-colors">{t.contact}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-white mb-6">Legal</h4>
          <ul className="space-y-3 text-sm text-white/75">
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
        <p className="text-xs text-white/60">
          © {year} {tenant.name}. Alle Rechte vorbehalten.
        </p>
        <div className="flex gap-3 opacity-50">
          <CreditCard width={22} />
          <Wallet width={22} />
        </div>
      </div>
    </footer>
  );
}
