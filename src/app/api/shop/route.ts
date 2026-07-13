import { NextResponse } from "next/server";
import { loadBundle } from "@/lib/connect";

// Aggregate storefront payload (settings + categories + products + promotions +
// paymentProviders), composed from the /connect endpoints. This is the single
// call the storefront page uses on load.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await loadBundle());
  } catch (err) {
    console.error("[api/shop] failed:", err);
    return NextResponse.json({ error: "shop_unavailable" }, { status: 502 });
  }
}
