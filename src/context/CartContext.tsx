"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  key: string; // productId | variationId | sorted extra ids
  productId: string;
  variationId?: string;
  extraChoiceIds: string[];
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (line: Omit<CartItem, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  ready: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "meshop.cart.v1";

function lineKey(line: Omit<CartItem, "key">): string {
  return [line.productId, line.variationId ?? "-", [...line.extraChoiceIds].sort().join("+")].join("|");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  // Persist on change (after initial load).
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items, ready]);

  const add = useCallback((line: Omit<CartItem, "key">) => {
    const key = lineKey(line);
    setItems((prev) => {
      const ix = prev.findIndex((i) => i.key === key);
      if (ix >= 0) {
        const next = [...prev];
        next[ix] = { ...next[ix], qty: next[ix].qty + line.qty };
        return next;
      }
      return [...prev, { ...line, key }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({ items, count: items.reduce((s, i) => s + i.qty, 0), add, setQty, remove, clear, ready }),
    [items, add, setQty, remove, clear, ready]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
