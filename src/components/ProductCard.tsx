"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { catalogPrice, defaultVariation, cheapestChoice, effectiveAvailability } from "@/lib/pricing";
import { productImageUrl } from "@/lib/image";
import { PriceTag } from "@/components/PriceTag";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { ProductImage } from "@/components/ProductImage";
import type { Currency, PublicShopProduct, PublicShopPromotion } from "@/lib/types";

export function ProductCard({
  product,
  promotions,
  currency = "CHF",
  eyebrow,
  priority,
}: {
  product: PublicShopProduct;
  promotions: PublicShopPromotion[];
  currency?: Currency;
  eyebrow?: string;
  priority?: boolean;
}) {
  const { add } = useCart();
  const { tx, t } = useLocale();
  const router = useRouter();

  const href = `/product/${product.id}`;
  // Products with required custom inputs (or required extras) can't be added with
  // defaults — send the shopper to the detail page to configure them.
  const needsConfig =
    (product.userInputs ?? []).some((u) => u.required) ||
    product.extras.some((g) => g.isActive && g.required && g.selectionType === "MULTIPLE");
  const name = tx(product.displayName) || t.product;
  const price = catalogPrice(product, promotions);
  const availability = effectiveAvailability(product);
  const unavailable = availability === "UNAVAILABLE";
  const img = productImageUrl(product);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (unavailable) return;
    // Anything needing per-order configuration goes to the detail page.
    if (needsConfig) {
      router.push(href);
      return;
    }
    // Pick sensible defaults: default variation + cheapest choice of each required SINGLE group.
    const requiredExtras = product.extras
      .filter((g) => g.isActive && g.required && g.selectionType === "SINGLE" && g.choices.length)
      .map((g) => cheapestChoice(g)!.id);
    add({
      productId: product.id,
      variationId: defaultVariation(product)?.id,
      extraChoiceIds: requiredExtras,
      qty: 1,
    });
    toast.success(t.addToCart, { description: name });
  }

  return (
    <div className="group">
      <div className="relative aspect-[4/5] bg-card border border-border rounded-md overflow-hidden mb-4">
        <Link href={href} aria-label={name}>
          <ProductImage
            src={img}
            alt={name}
            seed={product.id}
            priority={priority}
            fit="contain"
            sizes="(max-width: 768px) 50vw, 25vw"
            className="transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        {price.discountPct > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-brand-ink text-white px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide">
            −{price.discountPct}%
          </span>
        )}

        {!unavailable && (
          <button
            type="button"
            onClick={quickAdd}
            aria-label={t.addToCart}
            className="absolute bottom-3.5 right-3.5 w-11 h-11 bg-card border border-border rounded-full flex items-center justify-center text-brand-ink shadow-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-ink hover:text-white hover:border-brand-ink"
          >
            <Plus width={18} />
          </button>
        )}
      </div>

      {eyebrow && <p className="eyebrow text-brand-gray mb-1.5">{eyebrow}</p>}

      <Link href={href}>
        <h3 className="font-serif text-lg sm:text-xl leading-snug text-brand-ink tracking-tight hover:text-brand-green transition-colors">
          {name}
        </h3>
      </Link>

      <div className="mt-2">
        <PriceTag
          stack
          size="lg"
          price={price.price}
          compareAt={price.compareAt}
          discountPct={0}
          currency={currency}
        />
        {availability !== "UNLIMITED" && (
          <div className="mt-2.5">
            <AvailabilityBadge status={availability} />
          </div>
        )}
      </div>
    </div>
  );
}
