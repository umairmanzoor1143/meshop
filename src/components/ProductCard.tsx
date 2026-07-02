"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { catalogPrice, defaultVariation, effectiveAvailability } from "@/lib/pricing";
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

  const href = `/product/${product.id}`;
  const name = tx(product.displayName) || t.product;
  const price = catalogPrice(product, promotions);
  const availability = effectiveAvailability(product);
  const unavailable = availability === "UNAVAILABLE";
  const img = productImageUrl(product);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (unavailable) return;
    // Pick sensible defaults: default variation + first choice of each required group.
    const requiredExtras = product.extras
      .filter((g) => g.required && g.choices.length)
      .map((g) => g.choices[0].id);
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
      <div className="relative aspect-[3/4] bg-brand-tile rounded-sm overflow-hidden mb-3">
        <Link href={href} aria-label={name}>
          <ProductImage
            src={img}
            alt={name}
            seed={product.id}
            priority={priority}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {price.discountPct > 0 && (
          <span className="absolute top-3 left-3 bg-card/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide text-brand-green">
            −{price.discountPct}%
          </span>
        )}

        {!unavailable && (
          <button
            type="button"
            onClick={quickAdd}
            aria-label={t.addToCart}
            className="absolute bottom-3 right-3 w-9 h-9 bg-card/90 backdrop-blur rounded-full flex items-center justify-center text-brand-ink shadow-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-ink hover:text-white"
          >
            <Plus width={16} />
          </button>
        )}
      </div>

      {eyebrow && <p className="eyebrow text-brand-gray mb-1">{eyebrow}</p>}

      <Link href={href}>
        <h3 className="font-serif text-[15px] leading-snug text-brand-ink tracking-tight hover:text-brand-green transition-colors">
          {name}
        </h3>
      </Link>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <PriceTag
          size="sm"
          price={price.price}
          compareAt={price.compareAt}
          discountPct={price.discountPct}
          currency={currency}
        />
        {availability !== "UNLIMITED" && <AvailabilityBadge status={availability} />}
      </div>
    </div>
  );
}
