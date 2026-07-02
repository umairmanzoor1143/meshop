import { cache } from "react";
import { headers } from "next/headers";
import type { PublicShopBundle, PublicShopProduct } from "./types";

// Page-facing data access. Server Components call the app's own /api/shop route
// handlers (which hold the connect-token) rather than the backend directly, so
// the whole app consumes one internal API surface and the token stays server-side.
// Wrapped in React cache() so the layout and page share one fetch per request.

async function baseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${await baseUrl()}/api/shop${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`GET /api/shop${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export const getShopBundle = cache(async (): Promise<PublicShopBundle> => {
  return apiGet<PublicShopBundle>("");
});

export const getProduct = cache(async (id: string): Promise<PublicShopProduct | null> => {
  try {
    return await apiGet<PublicShopProduct>(`/products/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
});
