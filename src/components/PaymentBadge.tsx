import { CreditCard, Landmark, QrCode, Wallet } from "lucide-react";
import type { PaymentProviderType } from "@/lib/types";

// The public payment-provider API exposes no logo, so we render a recognizable
// payment-method chip per provider type (TWINT = QR/mobile, SAFERPAY = card,
// BANK_ACCOUNT = bank). Swap to real brand logos here if asset URLs become available.
export function PaymentBadge({ provider }: { provider: PaymentProviderType }) {
  const Icon = provider === "TWINT" ? QrCode : provider === "SAFERPAY" ? CreditCard : provider === "BANK_ACCOUNT" ? Landmark : Wallet;
  return (
    <span className="w-10 h-8 shrink-0 rounded-md border border-border bg-white flex items-center justify-center">
      <Icon width={18} strokeWidth={1.6} className="text-brand-ink" />
    </span>
  );
}
