"use client";

import { LocaleProvider } from "@/context/LocaleContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";
import type { Language } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export function Providers({
  children,
  initialLocale,
  defaultLanguage,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  defaultLanguage: Language;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale} defaultLanguage={defaultLanguage}>
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
  );
}
