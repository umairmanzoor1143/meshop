import { NextResponse } from "next/server";
import { loadProducts } from "@/lib/connect";

export const revalidate = 60;

export async function GET() {
  try {
    return NextResponse.json(await loadProducts());
  } catch (err) {
    console.error("[api/shop/products] failed:", err);
    return NextResponse.json({ error: "products_unavailable" }, { status: 502 });
  }
}
