import type {
  LimitedOffer,
  ProductVariation,
  PublicShopProduct,
  PublicShopPromotion,
  PublicShopSettings,
  FulfillmentMode,
} from "./types";

// ---------------------------------------------------------------------------
// Pure pricing engine. No React, no I/O — safe to use on server or client.
// Composition rule: a product's own limitedOffer sets its sale price; store
// promotions then apply ON TOP, but a line that already has an active
// limitedOffer is EXCLUDED from promotions (no stacking of sale + campaign).
// ---------------------------------------------------------------------------

export type DeliveryTier = "standard" | "premium";

/**
 * Effective availability: the type gate plus the optional availableFrom/To
 * window. Outside the window a product is treated as UNAVAILABLE.
 */
export function effectiveAvailability(
  product: PublicShopProduct,
  now = new Date()
): "UNLIMITED" | "LIMITED" | "UNAVAILABLE" {
  const a = product.availability;
  if (a.availabilityType === "UNAVAILABLE") return "UNAVAILABLE";
  const t = now.getTime();
  if (a.availableFrom && t < new Date(a.availableFrom).getTime()) return "UNAVAILABLE";
  if (a.availableTo && t > new Date(a.availableTo).getTime()) return "UNAVAILABLE";
  return a.availabilityType;
}

export function limitedOfferActive(offer: LimitedOffer | undefined, now = new Date()): boolean {
  if (!offer) return false;
  const start = new Date(offer.startDate).getTime();
  const end = new Date(offer.endDate).getTime();
  const t = now.getTime();
  return t >= start && t <= end && typeof offer.salePrice === "number";
}

export function getVariation(product: PublicShopProduct, variationId?: string): ProductVariation | undefined {
  if (variationId) {
    const found = product.variations.find((v) => v.id === variationId);
    if (found) return found;
  }
  return defaultVariation(product);
}

export function defaultVariation(product: PublicShopProduct): ProductVariation | undefined {
  const active = product.variations.filter((v) => v.isActive);
  return active.find((v) => v.isDefault) ?? active[0] ?? product.variations[0];
}

export interface EffectivePrice {
  price: number; // what the customer pays per unit for the variation (pre-extras)
  compareAt: number | null; // struck-through original when on sale, else null
}

/** Variation price after applying its own limited offer (if active). */
export function variationEffectivePrice(variation: ProductVariation | undefined, now = new Date()): EffectivePrice {
  if (!variation) return { price: 0, compareAt: null };
  if (limitedOfferActive(variation.limitedOffer, now)) {
    return { price: variation.limitedOffer!.salePrice, compareAt: variation.price };
  }
  return { price: variation.price, compareAt: null };
}

/** Sum of selected extra choice price modifiers. */
export function extrasTotal(product: PublicShopProduct, extraChoiceIds: string[]): number {
  if (!extraChoiceIds.length) return 0;
  const set = new Set(extraChoiceIds);
  let sum = 0;
  for (const group of product.extras) {
    for (const choice of group.choices) {
      if (set.has(choice.id)) sum += choice.priceModifier;
    }
  }
  return sum;
}

/** Unit price = effective variation price + selected extras. */
export function unitPrice(
  product: PublicShopProduct,
  variationId: string | undefined,
  extraChoiceIds: string[],
  now = new Date()
): number {
  const v = getVariation(product, variationId);
  return variationEffectivePrice(v, now).price + extrasTotal(product, extraChoiceIds);
}

/** Card/PDP list price for the default variation, with compare-at + discount %. */
export function listPrice(product: PublicShopProduct, now = new Date()): EffectivePrice & { discountPct: number } {
  const eff = variationEffectivePrice(defaultVariation(product), now);
  const discountPct =
    eff.compareAt && eff.compareAt > eff.price ? Math.round((1 - eff.price / eff.compareAt) * 100) : 0;
  return { ...eff, discountPct };
}

/**
 * Card/PDP display price for the default variation with store promotions
 * overlaid on top of any own limited offer (own sale wins; promotions apply
 * only when there is no own sale, per the no-stacking rule).
 */
export function catalogPrice(
  product: PublicShopProduct,
  promotions: PublicShopPromotion[],
  now = new Date()
): { price: number; compareAt: number | null; discountPct: number } {
  const eff = variationEffectivePrice(defaultVariation(product), now);
  if (eff.compareAt && eff.compareAt > eff.price) {
    return { price: eff.price, compareAt: eff.compareAt, discountPct: Math.round((1 - eff.price / eff.compareAt) * 100) };
  }
  const base = eff.price;
  const promo = bestPromotion(product, base, promotions, now);
  if (promo && promo.discount > 0) {
    const price = Math.max(0, base - promo.discount);
    return { price, compareAt: base, discountPct: base > 0 ? Math.round((1 - price / base) * 100) : 0 };
  }
  return { price: base, compareAt: null, discountPct: 0 };
}

export function hasOwnSale(product: PublicShopProduct, variationId: string | undefined, now = new Date()): boolean {
  const v = getVariation(product, variationId);
  return limitedOfferActive(v?.limitedOffer, now) || limitedOfferActive(product.limitedOffer, now);
}

// ---- Promotions ----------------------------------------------------------

export function promotionApplies(promo: PublicShopPromotion, product: PublicShopProduct, now = new Date()): boolean {
  if (!promo.isActive) return false;
  if (promo.startDate && now.getTime() < new Date(promo.startDate).getTime()) return false;
  if (promo.endDate && now.getTime() > new Date(promo.endDate).getTime()) return false;
  switch (promo.scope) {
    case "SHOP_WIDE":
      return true;
    case "CATEGORY":
      return !!promo.categoryIds?.includes(product.categoryId);
    case "PRODUCT":
      return !!promo.productIds?.includes(product.id);
    default:
      return false;
  }
}

/** Discount amount a single promotion yields on a given line amount. */
export function promotionDiscount(promo: PublicShopPromotion, amount: number): number {
  if (promo.discountType === "PERCENTAGE") {
    return Math.min(amount, (amount * promo.discountValue) / 100);
  }
  return Math.min(amount, promo.discountValue); // FIXED_AMOUNT
}

/** Is this promotion currently within its active window? */
export function promotionActiveNow(promo: PublicShopPromotion, now = new Date()): boolean {
  if (!promo.isActive) return false;
  if (promo.startDate && now.getTime() < new Date(promo.startDate).getTime()) return false;
  if (promo.endDate && now.getTime() > new Date(promo.endDate).getTime()) return false;
  return true;
}

/** The largest currently-active shop-wide promotion, or null. Real data only. */
export function activeShopWidePromotion(
  promotions: PublicShopPromotion[],
  now = new Date()
): PublicShopPromotion | null {
  let best: PublicShopPromotion | null = null;
  for (const promo of promotions) {
    if (promo.scope !== "SHOP_WIDE" || !promotionActiveNow(promo, now)) continue;
    if (!best || promo.discountValue > best.discountValue) best = promo;
  }
  return best;
}

/** Short discount label from real promotion values, e.g. "−10%" or "−CHF 5". */
export function promotionShortLabel(promo: PublicShopPromotion, currency = "CHF"): string {
  return promo.discountType === "PERCENTAGE"
    ? `−${promo.discountValue}%`
    : `−${currency} ${promo.discountValue}`;
}

/** Best (largest) applicable promotion for a line, or null. */
export function bestPromotion(
  product: PublicShopProduct,
  lineAmount: number,
  promotions: PublicShopPromotion[],
  now = new Date()
): { promo: PublicShopPromotion; discount: number } | null {
  let best: { promo: PublicShopPromotion; discount: number } | null = null;
  for (const promo of promotions) {
    if (!promotionApplies(promo, product, now)) continue;
    const discount = promotionDiscount(promo, lineAmount);
    if (!best || discount > best.discount) best = { promo, discount };
  }
  return best;
}

// ---- Cart totals ---------------------------------------------------------

export interface CartLineInput {
  product: PublicShopProduct;
  variationId?: string;
  extraChoiceIds: string[];
  qty: number;
}

export type CartLineComputed<T extends CartLineInput = CartLineInput> = T & {
  unit: number;
  lineTotal: number; // unit * qty, before promotion
  discount: number; // promotion discount for this line
  onSale: boolean;
};

export interface CartSummaryOptions {
  fulfillment: FulfillmentMode;
  deliveryTier?: DeliveryTier;
  now?: Date;
}

export interface CartSummary<T extends CartLineInput = CartLineInput> {
  lines: CartLineComputed<T>[];
  itemCount: number;
  subtotal: number; // sum of line totals (after own sale, before promotions)
  discount: number; // total promotion discount
  afterDiscount: number;
  surcharge: number; // small-order surcharge
  shipping: number;
  grand: number;
  tax: number; // tax portion (informational)
  taxRate: number;
  pricesIncludeTax: boolean;
  freeShippingPossible: boolean;
  freeShippingThreshold: number | null;
  freeShippingUnlocked: boolean;
  remainingForFreeShipping: number; // 0 when unlocked or not possible
}

function defaultTaxRate(settings: PublicShopSettings, products: PublicShopProduct[]): number {
  const def = settings.pricingTaxSettings.taxRates.find((r) => r.isDefault);
  if (def) return def.rate;
  if (settings.pricingTaxSettings.taxRates[0]) return settings.pricingTaxSettings.taxRates[0].rate;
  return products[0]?.taxRate ?? 0;
}

export function computeCart<T extends CartLineInput>(
  inputs: T[],
  settings: PublicShopSettings,
  promotions: PublicShopPromotion[],
  opts: CartSummaryOptions
): CartSummary<T> {
  const now = opts.now ?? new Date();
  const oms = settings.orderManagementSettings;

  const lines: CartLineComputed<T>[] = inputs.map((input) => {
    const unit = unitPrice(input.product, input.variationId, input.extraChoiceIds, now);
    const lineTotal = unit * input.qty;
    const onSale = hasOwnSale(input.product, input.variationId, now);
    // Sale items are excluded from stacking store promotions.
    const promo = onSale ? null : bestPromotion(input.product, lineTotal, promotions, now);
    return { ...input, unit, lineTotal, onSale, discount: promo?.discount ?? 0 };
  });

  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const discount = lines.reduce((s, l) => s + l.discount, 0);
  const afterDiscount = Math.max(0, subtotal - discount);

  // Small-order surcharge: below the configured order value → flat surcharge.
  const mqs = settings.checkoutBehaviourSettings.minimumQuantitySurcharge;
  const surcharge =
    mqs.enabled && mqs.threshold != null && mqs.surcharge != null && afterDiscount < mqs.threshold
      ? mqs.surcharge
      : 0;

  // Delivery.
  const threshold = oms.freeShippingThreshold ?? null;
  const freeShippingPossible = !!oms.freeShippingPossible && threshold != null;
  const freeShippingUnlocked = freeShippingPossible && afterDiscount >= (threshold as number);
  let shipping = 0;
  if (opts.fulfillment === "DELIVERY") {
    if (freeShippingUnlocked) shipping = 0;
    else {
      const prices = oms.deliveryPrices;
      shipping = opts.deliveryTier === "premium" ? prices?.premium ?? 0 : prices?.standard ?? 0;
    }
  }
  const remainingForFreeShipping =
    freeShippingPossible && !freeShippingUnlocked && opts.fulfillment === "DELIVERY"
      ? Math.max(0, (threshold as number) - afterDiscount)
      : 0;

  const grand = afterDiscount + surcharge + shipping;

  // Tax (informational; grand already includes it when pricesIncludeTax).
  const taxRate = defaultTaxRate(settings, inputs.map((i) => i.product));
  const pricesIncludeTax = settings.pricingTaxSettings.pricesIncludeTax;
  const tax = pricesIncludeTax
    ? grand - grand / (1 + taxRate / 100)
    : (grand * taxRate) / 100;
  const grandWithTax = pricesIncludeTax ? grand : grand + tax;

  return {
    lines,
    itemCount,
    subtotal,
    discount,
    afterDiscount,
    surcharge,
    shipping,
    grand: grandWithTax,
    tax,
    taxRate,
    pricesIncludeTax,
    freeShippingPossible,
    freeShippingThreshold: threshold,
    freeShippingUnlocked,
    remainingForFreeShipping,
  };
}
