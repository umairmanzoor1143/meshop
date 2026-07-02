import { NextResponse } from "next/server";
import { loadCategories } from "@/lib/connect";

export const revalidate = 60;

export async function GET() {
  try {
    return NextResponse.json(await loadCategories());
  } catch (err) {
    console.error("[api/shop/categories] failed:", err);
    return NextResponse.json({ error: "categories_unavailable" }, { status: 502 });
  }
}
