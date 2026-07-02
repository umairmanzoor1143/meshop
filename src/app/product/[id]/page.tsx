import { notFound } from "next/navigation";
import { getProduct, getShopBundle } from "@/lib/shop";
import { ProductView } from "@/components/views/ProductView";

export const revalidate = 60;

// Next 16: `params` is a Promise and must be awaited.
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, bundle] = await Promise.all([getProduct(id), getShopBundle().catch(() => null)]);
  if (!product) notFound();

  return (
    <ProductView
      product={product}
      settings={bundle?.settings}
      promotions={bundle?.promotions ?? []}
      categories={bundle?.categories ?? []}
      related={(bundle?.products ?? []).filter((p) => p.id !== product.id)}
    />
  );
}
