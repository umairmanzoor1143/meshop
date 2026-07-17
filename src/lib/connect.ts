import "server-only";

import type {
  PublicShopBundle,
  PublicShopProduct,
  PublicShopSettings,
  PublicShopCategory,
  PublicShopPromotion,
  PublicShopPaymentProvider,
  PublicCompany,
  CompanyAbout,
  OrderOverview,
  ReauthConfirmResult,
} from "./types";

// ---------------------------------------------------------------------------
// Server-only client for onra's e-shop API.
//
// The connect-token is read from a server env var and sent as the
// `connect-token` header. This module is imported ONLY by the route handlers in
// src/app/api/** — never by a client component — so the token never reaches the
// browser. `import "server-only"` makes that a build-time guarantee.
//
// Catalog + checkout endpoints moved from `/connect/shop/*` to `/e-shop/*`
// (Bruno, 2026-07-15). The base is configurable via CONNECT_SHOP_BASE so we can
// point at the old `/connect/shop` path until the new backend is redeployed.
// Ordering is GUEST checkout via the connect-token (no account/Bearer needed):
// POST {SHOP_BASE}/checkout/place-order returns a bundle + an order:read JWT +
// a hub URL. Company identity stays on `/connect/company/*` (not an e-shop feature).
// ---------------------------------------------------------------------------

const BASE = (process.env.CONNECT_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
const TOKEN = process.env.CONNECT_TOKEN ?? "";
const SHOP_ID = process.env.CONNECT_SHOP_ID ?? "";
// Shop/checkout base path. Default is the new `/e-shop`; set CONNECT_SHOP_BASE=/connect/shop
// to run against a backend that has not been redeployed with the rename yet.
const SHOP_BASE = (process.env.CONNECT_SHOP_BASE ?? "/e-shop").replace(/\/$/, "");
// Company identity (name/logo/contact) for COMPANY-owned shops. Optional — an
// association-owned shop has no company profile, so leave it unset there.
const COMPANY_ID = process.env.CONNECT_COMPANY_ID ?? "";

async function connectGet<T>(path: string): Promise<T> {
  // Always fetch live from the backend — catalog/price/promotion edits must show
  // immediately (no stale cache to clear). Caching can be reintroduced later via
  // an on-demand revalidate webhook if backend load becomes a concern.
  const res = await fetch(`${BASE}${path}`, {
    headers: { "connect-token": TOKEN, accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`connect GET ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

// Per-resource loaders — one per public endpoint. The API route handlers call
// these directly; the storefront pages then call those handlers.
export function loadSettings(shopId = SHOP_ID): Promise<PublicShopSettings> {
  return connectGet<PublicShopSettings>(`${SHOP_BASE}/${shopId}/settings`);
}
export function loadCategories(shopId = SHOP_ID): Promise<PublicShopCategory[]> {
  return connectGet<PublicShopCategory[]>(`${SHOP_BASE}/${shopId}/categories`);
}
export function loadProducts(shopId = SHOP_ID): Promise<PublicShopProduct[]> {
  return connectGet<PublicShopProduct[]>(`${SHOP_BASE}/${shopId}/products`);
}
export function loadPromotions(shopId = SHOP_ID): Promise<PublicShopPromotion[]> {
  return connectGet<PublicShopPromotion[]>(`${SHOP_BASE}/${shopId}/promotions`);
}
export function loadProduct(id: string, shopId = SHOP_ID): Promise<PublicShopProduct> {
  return connectGet<PublicShopProduct>(`${SHOP_BASE}/${shopId}/products/${id}`);
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
    return await connectGet<PublicShopPaymentProvider[]>(`${SHOP_BASE}/${shopId}/paymentProviders`);
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

/**
 * Real company identity from GET /connect/company/:companyId. Returns null (never
 * fabricated defaults) when the endpoint is unavailable or no companyId is set —
 * the storefront then simply omits the missing fields.
 */
export async function loadCompany(companyId = COMPANY_ID): Promise<PublicCompany | null> {
  if (!companyId) return null;
  try {
    return await connectGet<PublicCompany>(`/connect/company/${companyId}`);
  } catch (err) {
    console.warn("[meshop] company endpoint unavailable:", err);
    return null;
  }
}

/** Real company "about" copy from GET /connect/company/about/:companyId. Null when unavailable. */
export async function loadCompanyAbout(companyId = COMPANY_ID): Promise<CompanyAbout | null> {
  if (!companyId) return null;
  try {
    return await connectGet<CompanyAbout>(`/connect/company/about/${companyId}`);
  } catch (err) {
    console.warn("[meshop] company about endpoint unavailable:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Guest ordering (connect-token). No account / Bearer token: the buyer is a
// guest and the backend returns an order:read JWT + hub URL for viewing/paying.
// ---------------------------------------------------------------------------

export interface PlaceOrderResult {
  bundleId: string;
  accessToken: string; // order:read JWT (7-day) — use with the overview/hub
  hubUrl: string;
  hubApiUrl: string;
  orderIds: string[];
}

/** POST {SHOP_BASE}/checkout/place-order as a guest, authenticated by the connect-token. */
export async function placeGuestOrder(payload: unknown): Promise<PlaceOrderResult> {
  const res = await fetch(`${BASE}${SHOP_BASE}/checkout/place-order`, {
    method: "POST",
    headers: { "connect-token": TOKEN, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    let message = `place-order ${res.status}`;
    try {
      message = (JSON.parse(text).message as string) || message;
    } catch {
      /* keep default */
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return JSON.parse(text) as PlaceOrderResult;
}

// ---- Guest order access (public — no connect-token) ------------------------
// These routes are public and token/2FA-scoped, so they are NOT under SHOP_BASE
// and do not carry the connect-token.

async function publicGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

async function publicPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    let message = `POST ${path} -> ${res.status}`;
    try {
      message = (JSON.parse(text).message as string) || message;
    } catch {
      /* keep default */
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return JSON.parse(text) as T;
}

/** Order overview by the order:read JWT (from placeGuestOrder or re-auth confirm). */
export function getOrderOverview(token: string): Promise<OrderOverview> {
  return publicGet<OrderOverview>(`/shop/orders/public/overview?token=${encodeURIComponent(token)}`);
}

/** Step 1 of guest re-access: email a 2FA code to the address on the order.
 *  Always resolves { status: "accepted" } (never reveals whether the order exists). */
export function requestOrderReauth(orderReference: string, email: string): Promise<{ status: string }> {
  return publicPost(`/shop/orders/public/re-auth/request`, { orderReference, email });
}

/** Step 2: confirm the 2FA code; returns a fresh access token + order metadata. */
export function confirmOrderReauth(orderReference: string, email: string, code: string): Promise<ReauthConfirmResult> {
  return publicPost<ReauthConfirmResult>(`/shop/orders/public/re-auth/confirm`, { orderReference, email, code });
}

/** Compose the full storefront bundle from the per-resource endpoints. */
export async function loadBundle(shopId = SHOP_ID): Promise<PublicShopBundle> {
  const [settings, categories, products, promotions, paymentProviders, company, about] =
    await Promise.all([
      loadSettings(shopId),
      loadCategories(shopId),
      loadProducts(shopId),
      loadPromotions(shopId),
      loadPaymentProviders(shopId),
      loadCompany(),
      loadCompanyAbout(),
    ]);
  return {
    ownerId: "",
    shopId,
    settings,
    categories,
    products,
    promotions,
    paymentProviders,
    company,
    about,
  };
}
