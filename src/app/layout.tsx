import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getTenant } from "@/lib/theme";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const tenant = getTenant(process.env.NEXT_PUBLIC_TENANT);

export const metadata: Metadata = {
  title: `${tenant.name} — ${tenant.tagline}`,
  description:
    "Der Marktplatz für lokalen Genuss aus Küssnacht am Rigi und Umgebung. Marktstände, regionale Produkte und Anlässe — direkt und fair.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Data is fetched on the CLIENT (see ShopDataProvider) so all /api/shop/*
  // calls are visible in the browser Network tab. Header/Footer read it via context.
  return (
    <html
      lang="de"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          {/* Block (not flex) so page <section>s fill their max-width and never
              shrink to content — otherwise mx-auto flex items re-center when a
              grid is empty, shifting the sidebar. flex-grow still pushes the footer down. */}
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
