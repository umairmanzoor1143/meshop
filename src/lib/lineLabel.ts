import type { PublicShopProduct, TextTranslation } from "./types";

/**
 * Human-readable description of a configured line: the chosen variation (only
 * when the product has more than one) plus every selected extra choice.
 * Takes a translate callback so it stays framework-agnostic.
 */
export function describeLineConfig(
  product: PublicShopProduct,
  variationId: string | undefined,
  extraChoiceIds: string[],
  tx: (t: TextTranslation | undefined) => string
): string[] {
  const parts: string[] = [];
  if (product.variations.length > 1) {
    const v = product.variations.find((x) => x.id === variationId);
    if (v) parts.push(tx(v.displayName));
  }
  const chosen = new Set(extraChoiceIds);
  for (const group of product.extras) {
    for (const choice of group.choices) {
      if (chosen.has(choice.id)) parts.push(tx(choice.displayName));
    }
  }
  return parts;
}
