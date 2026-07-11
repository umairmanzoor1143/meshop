"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCartLines } from "@/context/useCartLines";
import { useLocale } from "@/context/LocaleContext";
import { computeCart, type DeliveryTier } from "@/lib/pricing";
import { describeLineConfig } from "@/lib/lineLabel";
import { createOrderRef, submitOrder } from "@/lib/order";
import { formatMoney } from "@/lib/format";
import { companyPickupInfo } from "@/lib/company";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SummaryLines } from "@/components/SummaryLines";
import { PaymentBadge } from "@/components/PaymentBadge";
import { useShopData } from "@/context/ShopDataContext";
import { PageLoading, PageError } from "@/components/PageState";
import { cn } from "@/lib/utils";
import type { FulfillmentMode, PublicShopBundle } from "@/lib/types";

export function CheckoutView() {
  const { bundle, loading, error } = useShopData();
  if (loading) return <PageLoading />;
  if (error || !bundle) return <PageError />;
  return <CheckoutForm bundle={bundle} />;
}

function CheckoutForm({ bundle }: { bundle: PublicShopBundle }) {
  const { products, settings, promotions, paymentProviders } = bundle;
  const { t, tx } = useLocale();
  const { clear, ready } = useCart();
  const router = useRouter();
  const lines = useCartLines(products);
  const currency = settings.pricingTaxSettings.currencies[0] ?? "CHF";

  // Fulfillment options = shop methods constrained to what every product in the
  // cart actually supports (a reservation-only booking shouldn't offer delivery).
  const shopMethods = settings.orderManagementSettings.fulfillmentMethods.length
    ? settings.orderManagementSettings.fulfillmentMethods
    : (["PICKUP"] as FulfillmentMode[]);
  const productModeLists = lines
    .map((l) => l.product.fulfillmentModes)
    .filter((m): m is FulfillmentMode[] => !!m && m.length > 0);
  const constrained = shopMethods.filter((m) => productModeLists.every((modes) => modes.includes(m)));
  const methods = productModeLists.length && constrained.length ? constrained : shopMethods;
  const activeProviders = paymentProviders.filter((p) => p.isActive);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", street: "", zip: "", city: "" });
  const [fulfillment, setFulfillment] = useState<FulfillmentMode>(methods[0]);
  const [tier, setTier] = useState<DeliveryTier>("standard");
  const [paymentId, setPaymentId] = useState(
    (activeProviders.find((p) => p.isDefault) ?? activeProviders[0])?.id ?? ""
  );
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(
    () => computeCart(lines, settings, promotions, { fulfillment, deliveryTier: tier }),
    [lines, settings, promotions, fulfillment, tier]
  );

  // The cart hydrates from localStorage after mount, so the allowed methods can
  // narrow once items load. Keep the selected fulfillment within the allowed set.
  useEffect(() => {
    if (!methods.includes(fulfillment)) setFulfillment(methods[0]);
  }, [methods, fulfillment]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const label = (m: FulfillmentMode) =>
    m === "DELIVERY" ? t.delivery : m === "PICKUP" ? t.pickup : m === "DIGITAL" ? t.digital : t.reservation;

  if (!ready) return <div className="min-h-[40vh]" />;

  if (lines.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-brand-ink mb-4">{t.emptyCart}</h1>
        <Link href="/" className="text-xs uppercase tracking-widest text-brand-green hover:underline">
          {t.continueShopping}
        </Link>
      </section>
    );
  }

  async function placeOrder() {
    if (!form.firstName || !form.lastName || !form.email) return toast.error(t.contact);
    if (settings.checkoutBehaviourSettings.requirePhoneNumber && !form.phone) return toast.error(t.phone);
    if (fulfillment === "DELIVERY" && (!form.street || !form.zip || !form.city)) return toast.error(t.addr);
    if (!paymentId) return toast.error(t.payTitle);
    if (!terms) return toast.error(t.termsLbl);

    const provider = activeProviders.find((p) => p.id === paymentId)!;
    setSubmitting(true);
    try {
      await submitOrder({
        ref: createOrderRef(),
        grand: summary.grand,
        paymentType: provider.provider,
        paymentName: provider.name,
        fulfillment,
        email: form.email,
      });
      clear();
      router.push("/checkout/success");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-brand-ink font-normal mb-10">{t.checkout}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
        {/* Form */}
        <div className="lg:col-span-3 space-y-10">
          {/* Contact */}
          <div>
            <h2 className="eyebrow text-brand-ink mb-4">{t.contact}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field id="firstName" label={t.firstName} value={form.firstName} onChange={set("firstName")} />
              <Field id="lastName" label={t.lastName} value={form.lastName} onChange={set("lastName")} />
              <Field id="email" label={t.email} type="email" value={form.email} onChange={set("email")} className="col-span-2" />
              <Field
                id="phone"
                label={t.phone}
                value={form.phone}
                onChange={set("phone")}
                className="col-span-2"
                required={settings.checkoutBehaviourSettings.requirePhoneNumber}
              />
            </div>
          </div>

          {/* Fulfillment */}
          <div>
            <h2 className="eyebrow text-brand-ink mb-4">{t.fulfillment}</h2>
            <div className="grid grid-cols-2 gap-3">
              {methods.map((m) => (
                <SelectCard key={m} selected={fulfillment === m} onClick={() => setFulfillment(m)}>
                  {label(m)}
                </SelectCard>
              ))}
            </div>

            {fulfillment === "DELIVERY" && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-6 gap-4">
                  <Field id="street" label={t.street} value={form.street} onChange={set("street")} className="col-span-6" />
                  <Field id="zip" label={t.zip} value={form.zip} onChange={set("zip")} className="col-span-2" />
                  <Field id="city" label={t.city} value={form.city} onChange={set("city")} className="col-span-4" />
                </div>
                {settings.orderManagementSettings.deliveryPrices && (
                  <div className="grid grid-cols-2 gap-3">
                    <SelectCard selected={tier === "standard"} onClick={() => setTier("standard")}>
                      {t.standard} · {formatMoney(settings.orderManagementSettings.deliveryPrices.standard, currency)}
                    </SelectCard>
                    <SelectCard selected={tier === "premium"} onClick={() => setTier("premium")}>
                      {t.premium} · {formatMoney(settings.orderManagementSettings.deliveryPrices.premium, currency)}
                    </SelectCard>
                  </div>
                )}
              </div>
            )}

            {fulfillment === "PICKUP" && (companyPickupInfo(bundle.company) || t.pickup) && (
              <p className="mt-4 text-xs font-normal text-brand-gray leading-relaxed">
                {t.pickupLabel}
                {companyPickupInfo(bundle.company) ? ` · ${companyPickupInfo(bundle.company)}` : ""}
              </p>
            )}
          </div>

          {/* Payment */}
          <div>
            <h2 className="eyebrow text-brand-ink mb-4">{t.payTitle}</h2>
            <div className="space-y-3">
              {activeProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPaymentId(p.id)}
                  className={cn(
                    "w-full flex items-center gap-3 border rounded-md h-12 px-4 text-sm transition-all text-left",
                    paymentId === p.id ? "border-brand-ink bg-brand-ink/[0.03]" : "border-brand-ink/20 hover:border-brand-ink/50"
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                      paymentId === p.id ? "border-brand-ink bg-brand-ink" : "border-brand-gray"
                    )}
                  >
                    {paymentId === p.id && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </span>
                  <PaymentBadge provider={p.provider} />
                  <span className="flex-1">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-2">
          <div className="bg-card border border-border rounded-md p-6 lg:sticky lg:top-28">
            <div className="space-y-3 pb-5 mb-5 border-b border-brand-ink/10">
              {summary.lines.map((line) => {
                const cfg = describeLineConfig(line.product, line.variationId, line.extraChoiceIds, tx);
                return (
                  <div key={line.key} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-brand-ink">
                      {line.qty} × {tx(line.product.displayName)}
                      {cfg.length > 0 && <span className="text-brand-gray block">{cfg.join(" · ")}</span>}
                    </span>
                    <span className="text-brand-ink shrink-0">{formatMoney(line.lineTotal - line.discount, currency)}</span>
                  </div>
                );
              })}
            </div>

            <SummaryLines summary={summary} currency={currency} showShipping={fulfillment === "DELIVERY"} />

            {/* Terms */}
            <button onClick={() => setTerms((v) => !v)} className="flex items-start gap-2.5 mt-5 text-left">
              <span
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                  terms ? "bg-brand-ink border-brand-ink" : "border-brand-gray"
                )}
              >
                {terms && <Check width={12} className="text-white" />}
              </span>
              <span className="text-[11px] text-brand-gray leading-relaxed">
                {t.termsLbl}
                {settings.termsUrl && (
                  <>
                    {" "}
                    <a href={settings.termsUrl} target="_blank" rel="noreferrer" className="underline">
                      {t.footerTerms}
                    </a>
                  </>
                )}
              </span>
            </button>

            <button
              onClick={placeOrder}
              disabled={submitting}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-brand-ink text-white rounded-md h-12 text-xs tracking-widest uppercase font-medium hover:bg-brand-ink/90 transition-colors disabled:opacity-50"
            >
              {t.placeOrder}
              <ArrowRight width={15} />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  className,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-xs text-brand-gray mb-2 block">
        {label}
        {required && <span className="text-brand-gold"> *</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="h-12 text-sm rounded-md border-brand-ink/20 focus-visible:border-brand-ink focus-visible:ring-0 bg-transparent"
      />
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border rounded-md h-12 px-4 text-sm transition-all flex items-center justify-center text-center",
        selected ? "border-brand-ink bg-brand-ink/[0.03]" : "border-brand-ink/20 hover:border-brand-ink/50"
      )}
    >
      {children}
    </button>
  );
}
