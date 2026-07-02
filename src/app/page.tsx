import { getShopBundle } from "@/lib/shop";
import { CatalogView } from "@/components/views/CatalogView";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; promo?: string }>;
}) {
  const sp = await searchParams;

  let bundle;
  try {
    bundle = await getShopBundle();
  } catch {
    return (
      <section className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-3xl text-brand-ink mb-3">Shop momentan nicht verfügbar</h1>
        <p className="text-sm text-brand-gray">Bitte versuchen Sie es in Kürze erneut.</p>
      </section>
    );
  }

  return (
    <CatalogView
      key={`${sp.cat ?? ""}|${sp.q ?? ""}|${sp.promo ?? ""}`}
      bundle={bundle}
      initialCat={sp.cat}
      initialQ={sp.q}
      initialPromo={sp.promo === "1"}
    />
  );
}
