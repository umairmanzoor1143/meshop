import type { PublicShopBundle, PublicShopProduct, PublicCompany, CompanyAbout } from "./types";

// Browser-side data access. These fetches run in the CLIENT, hitting our own
// /api/shop/* route handlers — so every call is visible in the browser Network
// tab for debugging. The connect-token never leaves the server: it lives only
// in the route handlers (src/app/api/shop/**), which this module calls by URL.

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.url} -> ${res.status}`);
  return (await res.json()) as T;
}

/** Fetch each public endpoint separately so all of Bruno's routes show in the Network tab. */
export async function fetchShopBundle(): Promise<PublicShopBundle> {
  const [settings, categories, products, promotions, paymentProviders, identity] = await Promise.all([
    fetch("/api/shop/settings").then((r) => json<PublicShopBundle["settings"]>(r)),
    fetch("/api/shop/categories").then((r) => json<PublicShopBundle["categories"]>(r)),
    fetch("/api/shop/products").then((r) => json<PublicShopBundle["products"]>(r)),
    fetch("/api/shop/promotions").then((r) => json<PublicShopBundle["promotions"]>(r)),
    fetch("/api/shop/payment-providers").then((r) => json<PublicShopBundle["paymentProviders"]>(r)),
    // Company identity is best-effort — never block the storefront on it, and
    // never fall back to fabricated data (null → fields are simply omitted).
    fetch("/api/shop/company")
      .then((r) => json<{ company: PublicCompany | null; about: CompanyAbout | null }>(r))
      .catch(() => ({ company: null, about: null })),
  ]);
  return {
    ownerId: "",
    shopId: settings.id,
    settings,
    categories,
    products,
    promotions,
    paymentProviders,
    company: identity.company,
    about: identity.about,
  };
}

export async function fetchProduct(id: string): Promise<PublicShopProduct | null> {
  const res = await fetch(`/api/shop/products/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return (await res.json()) as PublicShopProduct;
}
