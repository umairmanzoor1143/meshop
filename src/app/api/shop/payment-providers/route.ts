import { NextResponse } from "next/server";
import { loadPaymentProviders } from "@/lib/connect";

export const revalidate = 60;

export async function GET() {
  try {
    return NextResponse.json(await loadPaymentProviders());
  } catch (err) {
    console.error("[api/shop/payment-providers] failed:", err);
    return NextResponse.json({ error: "payment_providers_unavailable" }, { status: 502 });
  }
}
