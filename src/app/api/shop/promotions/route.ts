import { NextResponse } from "next/server";
import { loadPromotions } from "@/lib/connect";

export const revalidate = 60;

export async function GET() {
  try {
    return NextResponse.json(await loadPromotions());
  } catch (err) {
    console.error("[api/shop/promotions] failed:", err);
    return NextResponse.json({ error: "promotions_unavailable" }, { status: 502 });
  }
}
