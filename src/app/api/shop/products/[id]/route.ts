import { NextResponse } from "next/server";
import { loadProduct } from "@/lib/connect";

export const revalidate = 60;

// Next 16: dynamic route `params` is a Promise and must be awaited.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    return NextResponse.json(await loadProduct(id));
  } catch (err) {
    console.error(`[api/shop/products/${id}] failed:`, err);
    return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  }
}
