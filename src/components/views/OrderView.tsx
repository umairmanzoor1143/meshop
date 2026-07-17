"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import { formatMoney } from "@/lib/format";
import { fetchOrderOverview, requestOrderCode, confirmOrderCode } from "@/lib/order";
import type { OrderOverview } from "@/lib/types";

type Stage = "lookup" | "code" | "done";

export function OrderView() {
  const { t } = useLocale();
  const params = useSearchParams();
  const initialToken = params.get("token");

  const [stage, setStage] = useState<Stage>("lookup");
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [overview, setOverview] = useState<OrderOverview | null>(null);

  // If we arrive with a token (from the success page / hub link), load directly.
  useEffect(() => {
    if (!initialToken) return;
    setBusy(true);
    fetchOrderOverview(initialToken)
      .then((o) => {
        setOverview(o);
        setStage("done");
      })
      .catch(() => toast.error(t.orderNotFound))
      .finally(() => setBusy(false));
  }, [initialToken, t.orderNotFound]);

  async function sendCode() {
    if (!ref.trim() || !email.trim()) return;
    setBusy(true);
    try {
      await requestOrderCode(ref, email);
      setStage("code");
      toast.success(t.codeSent);
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!code.trim()) return;
    setBusy(true);
    try {
      const res = await confirmOrderCode(ref, email, code);
      const o = await fetchOrderOverview(res.accessToken);
      setOverview(o);
      setStage("done");
    } catch {
      toast.error(t.orderNotFound);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-16 lg:py-20">
      <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-brand-ink font-normal mb-3">
        {t.trackTitle}
      </h1>

      {stage !== "done" && (
        <p className="text-sm text-brand-gray leading-relaxed mb-8 max-w-md">{t.trackIntro}</p>
      )}

      {stage === "lookup" && (
        <div className="space-y-4 max-w-md">
          <Field label={t.orderRef} value={ref} onChange={setRef} />
          <Field label={t.email} type="email" value={email} onChange={setEmail} />
          <button
            onClick={sendCode}
            disabled={busy || !ref.trim() || !email.trim()}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-ink text-white rounded-md h-12 text-xs tracking-widest uppercase font-medium hover:bg-brand-green transition-colors disabled:opacity-50"
          >
            {t.sendCode} <ArrowRight width={15} />
          </button>
        </div>
      )}

      {stage === "code" && (
        <div className="space-y-4 max-w-md">
          <p className="flex items-center gap-2 text-sm text-brand-green">
            <CheckCircle2 width={16} /> {t.codeSent}
          </p>
          <Field label={t.codeLabel} value={code} onChange={setCode} inputMode="numeric" />
          <button
            onClick={confirm}
            disabled={busy || !code.trim()}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-ink text-white rounded-md h-12 text-xs tracking-widest uppercase font-medium hover:bg-brand-green transition-colors disabled:opacity-50"
          >
            {t.openOrder} <ArrowRight width={15} />
          </button>
        </div>
      )}

      {stage === "done" && overview && <OrderResult overview={overview} />}
    </section>
  );
}

function OrderResult({ overview }: { overview: OrderOverview }) {
  const { t } = useLocale();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-brand-ink/10">
        <span className="text-[11px] uppercase tracking-wider text-brand-gray">{t.orderRef}</span>
        <span className="font-mono text-sm text-brand-ink">
          {overview.bundleOrderNumber ?? overview.bundleId}
        </span>
      </div>

      {overview.orders.map((order) => {
        const currency = order.currency ?? "CHF";
        return (
          <div key={order.id} className="bg-card border border-border rounded-md p-6">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-4">
              <span className="text-brand-gray">
                {t.orderStatus}: <span className="text-brand-ink">{order.orderState}</span>
              </span>
              <span className="text-brand-gray">
                {t.paymentStatus}: <span className="text-brand-ink">{order.paymentState}</span>
              </span>
            </div>

            <div className="divide-y divide-brand-ink/5">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <span className="text-brand-ink">
                    {it.quantity} × {it.productName}
                    {it.variationLabel && <span className="text-brand-gray block">{it.variationLabel}</span>}
                  </span>
                  <span className="text-brand-ink shrink-0">{formatMoney(it.lineTotal, currency)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-brand-ink/10">
              <span className="text-sm text-brand-gray">{t.grand}</span>
              <span className="font-serif text-lg text-brand-ink">{formatMoney(order.total, currency)}</span>
            </div>
          </div>
        );
      })}

      <Link
        href="/"
        className="inline-flex items-center gap-2 border border-brand-ink/20 text-brand-ink rounded-md px-8 py-3 text-xs tracking-widest uppercase font-medium hover:border-brand-ink transition-colors"
      >
        {t.continueShopping}
      </Link>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: "numeric";
}) {
  return (
    <label className="block">
      <span className="eyebrow text-brand-ink mb-2 block">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 border border-brand-ink/20 rounded-md text-sm bg-card focus:outline-none focus:border-brand-ink transition-colors"
      />
    </label>
  );
}
