"use client";

import { useMemo } from "react";
import type { PublicShopProduct } from "@/lib/types";
import type { CartLineInput } from "@/lib/pricing";
import { useCart } from "./CartContext";

export interface JoinedCartLine extends CartLineInput {
  key: string;
}

/** Join persisted cart items with the current product catalogue. */
export function useCartLines(products: PublicShopProduct[]): JoinedCartLine[] {
  const { items } = useCart();
  return useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return items
      .map((it): JoinedCartLine | null => {
        const product = byId.get(it.productId);
        if (!product) return null;
        return {
          key: it.key,
          product,
          variationId: it.variationId,
          extraChoiceIds: it.extraChoiceIds,
          userInputs: it.userInputs,
          qty: it.qty,
        };
      })
      .filter((x): x is JoinedCartLine => x !== null);
  }, [items, products]);
}
