import type { S3FileProperties, ShopProductFile } from "./types";

// The public shop DTOs return raw S3 keys (product.imageKeys[].key,
// category.image.key), NOT resolved URLs. The backend builds public URLs as
// `${fileAccessUrl}/${bucketName}/${key}`. Set NEXT_PUBLIC_S3_PUBLIC_BASE_URL to
// that `${fileAccessUrl}/${bucketName}` prefix once Bruno confirms it.

const BASE = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ?? "";

/** Resolve an S3 key to a public URL, or null when no base is configured. */
export function imageUrl(key?: string | null): string | null {
  if (!key) return null;
  if (/^https?:\/\//i.test(key)) return key; // already a URL
  if (!BASE) return null; // fall back to placeholder tiles
  return `${BASE.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

export function productImageUrl(product: { imageKeys?: ShopProductFile[] }): string | null {
  return imageUrl(product.imageKeys?.[0]?.key);
}

export function categoryImageUrl(image?: S3FileProperties): string | null {
  return imageUrl(image?.thumbnailKey) ?? imageUrl(image?.key);
}
