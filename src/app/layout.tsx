import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getShopBundle } from "@/lib/shop";
import { getTenant } from "@/lib/theme";
import { normalizeLocale } from "@/lib/i18n";
import type { Language, PublicShopBundle } from "@/lib/types";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);

export const metadata: Metadata = {
  title: `${tenant.name} — ${tenant.tagline}`,
  description:
    "Der Marktplatz für lokalen Genuss aus Küssnacht am Rigi und Umgebung. Marktstände, regionale Produkte und Anlässe — direkt und fair.",
};

function anyPromotionActive(bundle: PublicShopBundle | null): boolean {
  if (!bundle) return false;
  const now = Date.now();
  return bundle.promotions.some(
    (p) =>
      p.isActive &&
      (!p.startDate || now >= new Date(p.startDate).getTime()) &&
      (!p.endDate || now <= new Date(p.endDate).getTime())
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch once at the layout; pages reuse the same cached request.
  const bundle = await getShopBundle().catch(() => null);
  const languages: Language[] = bundle?.settings.shopEnabledLanguages?.length
    ? bundle.settings.shopEnabledLanguages
    : ["DE", "EN"];
  const defaultLanguage: Language = bundle?.settings.defaultLanguage ?? "DE";
  const categories = bundle?.categories ?? [];
  const initialLocale = normalizeLocale(defaultLanguage.toLowerCase());

  return (
    <html
      lang={initialLocale}
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${montserrat.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Providers initialLocale={initialLocale} defaultLanguage={defaultLanguage}>
          <Header
            categories={categories}
            languages={languages}
            promoActive={anyPromotionActive(bundle)}
          />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer categories={categories} termsUrl={bundle?.settings.termsUrl} />
        </Providers>
      </body>
    </html>
  );
}
