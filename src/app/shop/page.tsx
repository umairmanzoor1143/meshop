import { ShopView } from "@/components/views/ShopView";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; promo?: string }>;
}) {
  const sp = await searchParams;
  return (
    <ShopView
      key={`${sp.cat ?? ""}|${sp.q ?? ""}|${sp.promo ?? ""}`}
      initialCat={sp.cat}
      initialQ={sp.q}
      initialPromo={sp.promo === "1"}
    />
  );
}
