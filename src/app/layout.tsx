import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppShell } from "@/components/AppShell";
import { loadCompany, loadCompanyAbout } from "@/lib/connect";
import { companyName, companyAboutIntro } from "@/lib/company";

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

// Title/description come from the real company webservice; nothing is fabricated.
// When the company endpoint is unavailable, we fall back to a neutral generic
// title rather than inventing a shop name.
export async function generateMetadata(): Promise<Metadata> {
  const [company, about] = await Promise.all([loadCompany(), loadCompanyAbout()]);
  const name = companyName(company);
  const intro = companyAboutIntro(about);
  return {
    title: name ?? "Shop",
    description: intro ?? undefined,
  };
}

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
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
