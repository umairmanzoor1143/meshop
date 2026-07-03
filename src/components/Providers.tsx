"use client";

import { LocaleProvider } from "@/context/LocaleContext";
import { CartProvider } from "@/context/CartContext";
import { ShopDataProvider } from "@/context/ShopDataContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ShopDataProvider>
      <LocaleProvider initialLocale="de" defaultLanguage="DE">
        <CartProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast: "!bg-foreground !text-background !border-transparent !rounded-md",
              },
            }}
          />
        </CartProvider>
      </LocaleProvider>
    </ShopDataProvider>
  );
}
