import Link from "next/link";
import { getShopBundle } from "@/lib/shop";
import { CartView } from "@/components/views/CartView";

export const revalidate = 60;

export default async function CartPage() {
  const bundle = await getShopBundle().catch(() => null);
  if (!bundle) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-3xl text-brand-ink mb-3">Shop momentan nicht verfügbar</h1>
        <Link href="/" className="text-xs uppercase tracking-widest text-brand-green hover:underline">
          ← Home
        </Link>
      </section>
    );
  }
  return <CartView bundle={bundle} />;
}
