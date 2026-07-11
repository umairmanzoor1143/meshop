"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FullPageLoading, PageError } from "@/components/PageState";
import { useShopData } from "@/context/ShopDataContext";

/**
 * Root gate: while the shop bundle is loading, cover the whole viewport with a
 * single full-page loader (no header/footer flash). Once data is ready, reveal
 * the entire shell at once.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, error, bundle } = useShopData();

  if (loading) return <FullPageLoading />;
  if (error || !bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageError />
      </div>
    );
  }

  return (
    <>
      <Header />
      {/* Block (not flex) so page <section>s fill their max-width and never
          shrink to content. flex-grow still pushes the footer down. */}
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
