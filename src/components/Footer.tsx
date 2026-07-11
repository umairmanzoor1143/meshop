"use client";

import Link from "next/link";
import { CreditCard, Wallet, MapPin, Mail, Globe } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons";
import { useLocale } from "@/context/LocaleContext";
import { useShopData } from "@/context/ShopDataContext";
import { buildCategoryTree } from "@/lib/categories";
import {
  companyName,
  companyAddressLine,
  companyEmail,
  companyAboutIntro,
  companySocialLinks,
} from "@/lib/company";

export function Footer() {
  const { t, tx } = useLocale();
  const { bundle } = useShopData();
  const tops = buildCategoryTree(bundle?.categories ?? []).slice(0, 4);
  const termsUrl = bundle?.settings.termsUrl;

  // Real company identity — every field rendered only when the webservice supplies it.
  const company = bundle?.company ?? null;
  const name = companyName(company);
  const addressLine = companyAddressLine(company);
  const email = companyEmail(company);
  const about = companyAboutIntro(bundle?.about ?? null);
  const socials = companySocialLinks(company);

  return (
    <footer className="bg-brand-ink text-white pt-20 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-10 mb-16">
        <div>
          {name && (
            <Link href="/" className="text-2xl font-serif tracking-tight font-medium block mb-4">
              {name}
            </Link>
          )}
          {about && <p className="text-sm text-white/75 leading-relaxed mb-6 max-w-xs">{about}</p>}
          <div className="space-y-2 text-sm text-white/75">
            {addressLine && (
              <p className="flex items-center gap-2.5">
                <MapPin width={15} className="shrink-0" />
                {addressLine}
              </p>
            )}
            {email && (
              <p className="flex items-center gap-2.5">
                <Mail width={15} className="shrink-0" />
                {email}
              </p>
            )}
          </div>
          {socials.length > 0 && (
            <div className="flex gap-4 mt-6">
              {socials.map((s) => {
                const Icon =
                  s.code.toLowerCase() === "instagram"
                    ? InstagramIcon
                    : s.code.toLowerCase() === "facebook"
                      ? FacebookIcon
                      : Globe;
                return (
                  <a
                    key={s.code + s.url}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.code}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <Icon width={20} />
                  </a>
                );
              })}
            </div>
          )}
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
            {email && (
              <li><a href={`mailto:${email}`} className="hover:text-white transition-colors">{t.contact}</a></li>
            )}
            {termsUrl && (
              <li>
                <a href={termsUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  {t.footerTerms}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        {name && <p className="text-xs text-white/60">© {new Date().getFullYear()} {name}</p>}
        <div className="flex gap-3 opacity-50">
          <CreditCard width={22} />
          <Wallet width={22} />
        </div>
      </div>
    </footer>
  );
}
