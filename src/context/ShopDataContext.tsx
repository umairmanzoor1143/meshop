"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { PublicShopBundle } from "@/lib/types";
import { fetchShopBundle } from "@/lib/clientShop";

interface ShopDataValue {
  bundle: PublicShopBundle | null;
  loading: boolean;
  error: boolean;
}

const ShopDataContext = createContext<ShopDataValue>({ bundle: null, loading: true, error: false });

export function ShopDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ShopDataValue>({ bundle: null, loading: true, error: false });

  useEffect(() => {
    let alive = true;
    fetchShopBundle()
      .then((bundle) => alive && setState({ bundle, loading: false, error: false }))
      .catch((err) => {
        console.error("[meshop] client shop fetch failed:", err);
        if (alive) setState({ bundle: null, loading: false, error: true });
      });
    return () => {
      alive = false;
    };
  }, []);

  return <ShopDataContext.Provider value={state}>{children}</ShopDataContext.Provider>;
}

export function useShopData(): ShopDataValue {
  return useContext(ShopDataContext);
}
