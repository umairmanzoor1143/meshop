"use client";

import Link from "next/link";
import { User, ShoppingBag, Mail } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getTenant } from "@/lib/theme";

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);

export default function AccountPage() {
  const { t, locale } = useLocale();
  const note =
    locale === "en"
      ? "You can order as a guest — no account required. A confirmation is sent to your email after every order."
      : "Sie können als Gast bestellen — kein Konto erforderlich. Nach jeder Bestellung erhalten Sie eine Bestätigung per E-Mail.";

  return (
    <section className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="flex justify-center mb-6">
        <User width={34} strokeWidth={1.2} className="text-brand-gray" />
      </div>
      <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-brand-ink font-light mb-4">
        {t.myAccount}
      </h1>
      <p className="text-sm font-light text-brand-gray leading-relaxed max-w-md mx-auto mb-10">{note}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-brand-ink text-white rounded-md px-7 py-3 text-xs tracking-widest uppercase font-medium hover:bg-brand-ink/90 transition-colors"
        >
          <ShoppingBag width={15} /> {t.shopNow}
        </Link>
        <a
          href={`mailto:${tenant.contact.email}`}
          className="inline-flex items-center justify-center gap-2 border border-brand-ink/20 rounded-md px-7 py-3 text-xs tracking-widest uppercase font-medium hover:border-brand-ink transition-colors"
        >
          <Mail width={15} /> {t.contact}
        </a>
      </div>
    </section>
  );
}
