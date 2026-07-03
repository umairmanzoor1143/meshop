"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <section className="max-w-xl mx-auto px-6 py-28 text-center flex flex-col items-center">
      <p className="font-serif text-6xl text-brand-ink/20 mb-4">404</p>
      <h1 className="font-serif text-3xl tracking-tight text-brand-ink font-normal mb-3">{t.notFoundTitle}</h1>
      <p className="text-sm font-normal text-brand-gray mb-8">{t.notFoundText}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-brand-ink text-white rounded-md px-7 py-3 text-xs tracking-widest uppercase font-medium hover:bg-brand-ink/90 transition-colors"
      >
        {t.backToShop}
      </Link>
    </section>
  );
}
