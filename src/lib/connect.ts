import "server-only";

import type {
  PublicShopBundle,
  PublicShopProduct,
  PublicShopSettings,
  PublicShopCategory,
  PublicShopPromotion,
  PublicShopPaymentProvider,
} from "./types";

// ---------------------------------------------------------------------------
// Server-only client for onra's `/connect` shop API.
//
// The connect-token is read from a server env var and sent as the
// `connect-token` header. This module is imported ONLY by the route handlers in
// src/app/api/shop/** — never by a client component — so the token never reaches
// the browser. `import "server-only"` makes that a build-time guarantee.
//
// Bruno recommends one aggregate call (`GET /connect/shop`), but that endpoint
// currently 500s on the dev backend until DETAILS_ENCRYPTION_DECRYPTION_KEY is
// configured, so we compose the storefront from the per-resource endpoints,
// which are live. Switch loadBundle() back to the aggregate once it is fixed.
// ---------------------------------------------------------------------------

const BASE = (process.env.CONNECT_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
const TOKEN = process.env.CONNECT_TOKEN ?? "";
const SHOP_ID = process.env.CONNECT_SHOP_ID ?? "";
const REVALIDATE = 60; // seconds — ISR cache window for catalog data

async function connectGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "connect-token": TOKEN, accept: "application/json" },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`connect GET ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

// Per-resource loaders — one per public endpoint. The API route handlers call
// these directly; the storefront pages then call those handlers.
export function loadSettings(shopId = SHOP_ID): Promise<PublicShopSettings> {
  return connectGet<PublicShopSettings>(`/connect/shop/${shopId}/settings`);
}
export function loadCategories(shopId = SHOP_ID): Promise<PublicShopCategory[]> {
  return connectGet<PublicShopCategory[]>(`/connect/shop/${shopId}/categories`);
}
export function loadProducts(shopId = SHOP_ID): Promise<PublicShopProduct[]> {
  return connectGet<PublicShopProduct[]>(`/connect/shop/${shopId}/products`);
}
export function loadPromotions(shopId = SHOP_ID): Promise<PublicShopPromotion[]> {
  return connectGet<PublicShopPromotion[]>(`/connect/shop/${shopId}/promotions`);
}
export function loadProduct(id: string, shopId = SHOP_ID): Promise<PublicShopProduct> {
  return connectGet<PublicShopProduct>(`/connect/shop/${shopId}/products/${id}`);
}

/**
 * Public payment-provider metadata. The dev backend's endpoint currently 500s
 * (same encryption-key issue as the aggregate), so we fall back to the Swiss
 * defaults the association uses for checkout. This is presentation metadata
 * only — no secrets — and is replaced by live data as soon as the endpoint is
 * fixed. It is intentionally NOT catalog mock data.
 */
export async function loadPaymentProviders(shopId = SHOP_ID): Promise<PublicShopPaymentProvider[]> {
  try {
    return await connectGet<PublicShopPaymentProvider[]>(`/connect/shop/${shopId}/paymentProviders`);
  } catch (err) {
    console.warn("[meshop] paymentProviders endpoint unavailable, using Swiss defaults:", err);
    const updated = new Date(0).toISOString();
    return [
      { id: "twint", provider: "TWINT", name: "TWINT", isDefault: true, isActive: true, updated },
      { id: "bank", provider: "BANK_ACCOUNT", name: "Überweisung / Bank Transfer", isDefault: false, isActive: true, updated },
      { id: "card", provider: "SAFERPAY", name: "Kredit-/Debitkarte", isDefault: false, isActive: true, updated },
    ];
  }
}

/** Compose the full storefront bundle from the per-resource endpoints. */
export async function loadBundle(shopId = SHOP_ID): Promise<PublicShopBundle> {
  const [settings, categories, products, promotions, paymentProviders] = await Promise.all([
    loadSettings(shopId),
    loadCategories(shopId),
    loadProducts(shopId),
    loadPromotions(shopId),
    loadPaymentProviders(shopId),
  ]);
  return {
    ownerId: process.env.CONNECT_OWNER_ID ?? "",
    shopId,
    settings,
    categories,
    products,
    promotions,
    paymentProviders,
  };
}
