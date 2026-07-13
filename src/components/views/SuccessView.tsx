"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, Package, Truck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useShopData } from "@/context/ShopDataContext";
import { loadLastOrder, type LastOrder } from "@/lib/order";
import { formatMoney } from "@/lib/format";
import { companyEmail } from "@/lib/company";

export function SuccessView() {
  const { t } = useLocale();
  const { bundle } = useShopData();
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    setOrder(loadLastOrder());
  }, []);

  const email = companyEmail(bundle?.company ?? null);
  const steps = [
    { icon: Package, label: t.step1 },
    { icon: Truck, label: t.step2 },
  ];

  return (
    <section className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="flex justify-center mb-6">
        <CircleCheck width={48} strokeWidth={1.2} className="text-brand-green" />
      </div>
      <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-brand-ink font-normal mb-4">
        {t.successTitle}
      </h1>
      <p className="text-sm font-normal text-brand-gray leading-relaxed max-w-md mx-auto mb-10">{t.successText}</p>

      {order && (
        <div className="bg-card border border-border rounded-md p-6 text-left mb-10">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-ink/10">
            <span className="text-[11px] uppercase tracking-wider text-brand-gray">{t.orderRef}</span>
            <span className="font-mono text-sm text-brand-ink">{order.bundleId}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-brand-gray">{t.grand}</span>
            <span className="font-serif text-lg text-brand-ink">{formatMoney(order.grand)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-brand-gray">{t.payTitle}</span>
            <span className="text-sm text-brand-ink">{order.paymentName}</span>
          </div>
          <p className="mt-4 pt-4 border-t border-brand-ink/10 text-[11px] text-brand-gray leading-relaxed">
            {t.payInstr}: {order.paymentName}
            {email ? ` · ${email}` : ""}
          </p>
        </div>
      )}

      {/* Next steps */}
      <div className="grid grid-cols-2 gap-3 mb-12">
        {steps.map(({ icon: Icon, label }, i) => (
          <div key={i} className="flex flex-col items-center gap-2.5">
            <span className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-brand-ink/70">
              <Icon width={17} strokeWidth={1.5} />
            </span>
            <span className="text-[10px] uppercase tracking-wide text-brand-gray leading-tight max-w-[9rem]">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {order?.hubUrl && (
          <a
            href={order.hubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-brand-ink text-white rounded-md px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-brand-green transition-colors"
          >
            {t.payOrder}
          </a>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-brand-ink/20 text-brand-ink rounded-md px-8 py-3 text-xs tracking-widest uppercase font-medium hover:border-brand-ink transition-colors"
        >
          {t.continueShopping}
        </Link>
      </div>
    </section>
  );
}
