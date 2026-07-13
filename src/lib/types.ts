// TypeScript mirror of the backend public shop DTOs
// (me/backend/src/modules/shop/public/shop-public.dto.ts and the underlying models).
// Keep these in sync with Bruno's /connect responses.

export type Language = "DE" | "EN" | "FR" | "IT";

/** Multilingual text: { DE?, EN?, FR?, IT? }. Resolve with resolveText(). */
export type TextTranslation = Partial<Record<Language, string>>;

export type ShopState =
  | "NO_SHOP_CONFIGURED"
  | "INCOMPLETE_CONFIGURATION"
  | "OFFLINE"
  | "ONLINE";

export type FulfillmentMode = "DELIVERY" | "PICKUP" | "DIGITAL" | "RESERVATION";

export type Currency = "CHF";

export type ExtraSelectionType = "SINGLE" | "MULTIPLE";

export type ProductAvailabilityType = "UNLIMITED" | "LIMITED" | "UNAVAILABLE";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export type PromotionScope = "SHOP_WIDE" | "CATEGORY" | "PRODUCT";

export type PaymentProviderType = "BANK_ACCOUNT" | "SAFERPAY" | "TWINT";

/** S3 file reference. `key` must be resolved to a URL via lib/image.ts. */
export interface S3FileProperties {
  mimeType: string;
  key: string;
  container: "PUBLIC" | "PRIVATE";
  thumbnailKey?: string;
  name?: string;
  description?: string;
}

export interface ShopProductFile {
  id: string;
  name: string;
  mimeType: string;
  key: string;
  container: "PUBLIC" | "PRIVATE";
  sortOrder?: number;
  title?: string;
  description?: string;
}

export interface TaxChoice {
  name: string;
  rate: number;
  isDefault?: boolean;
}

export interface PricingTaxSettings {
  currencies: Currency[];
  pricesIncludeTax: boolean;
  taxRates: TaxChoice[];
}

export interface DeliveryPrices {
  standard: number;
  premium: number;
}

export interface OrderManagementSettings {
  fulfillmentMethods: FulfillmentMode[];
  deliveryPrices?: DeliveryPrices;
  freeShippingPossible: boolean;
  freeShippingThreshold?: number;
}

export interface MinimumQuantitySurchargeSettings {
  enabled: boolean;
  threshold?: number;
  surcharge?: number;
}

export interface CheckoutBehaviourSettings {
  guestCheckoutEnabled: boolean;
  requirePhoneNumber: boolean;
  minimumQuantitySurcharge: MinimumQuantitySurchargeSettings;
}

export interface PublicShopSettings {
  id: string;
  state: ShopState;
  shopEnabledLanguages: Language[];
  defaultLanguage: Language;
  customSlug?: string;
  termsUrl?: string;
  pricingTaxSettings: PricingTaxSettings;
  orderManagementSettings: OrderManagementSettings;
  checkoutBehaviourSettings: CheckoutBehaviourSettings;
  associationSettings?: { associationMembersOnlyShop: boolean };
  updated: string;
}

export interface PublicShopCategory {
  id: string;
  parentCategoryId?: string;
  name: TextTranslation;
  description?: TextTranslation;
  image?: S3FileProperties;
  sortOrder: number;
  updated: string;
}

export interface LimitedOffer {
  startDate: string;
  endDate: string;
  salePrice: number;
  associationMemberSalePrice?: number;
  label?: TextTranslation;
}

export interface ProductVariation {
  id: string;
  displayName: TextTranslation;
  isDefault: boolean;
  sortOrder: number;
  price: number;
  isActive: boolean;
  limitedOffer?: LimitedOffer;
  updated: string;
}

export interface ProductExtraChoice {
  id: string;
  displayName: TextTranslation;
  sortOrder: number;
  priceModifier: number;
}

export interface ProductExtraGroup {
  id: string;
  displayName: TextTranslation;
  required: boolean;
  selectionType: ExtraSelectionType;
  choices: ProductExtraChoice[];
  sortOrder: number;
  isActive: boolean;
  updated: string;
}

export interface ProductAvailability {
  availabilityType: ProductAvailabilityType;
  availableFrom?: string;
  availableTo?: string;
}

export type UserInputType = "TEXT" | "NUMBER" | "DATE";

export interface ProductUserInput {
  id: string;
  name: string;
  displayName: TextTranslation;
  inputType: UserInputType;
  required: boolean;
  maxLength?: number;
  updated: string;
}

export interface PublicShopProduct {
  id: string;
  shopId: string;
  categoryId: string;
  displayName: TextTranslation;
  description: TextTranslation;
  additionalInfo?: TextTranslation;
  disclaimer?: TextTranslation;
  imageKeys: ShopProductFile[];
  taxRate: number;
  variations: ProductVariation[];
  extras: ProductExtraGroup[];
  userInputs: ProductUserInput[];
  availability: ProductAvailability;
  fulfillmentModes?: FulfillmentMode[];
  limitedOffer?: LimitedOffer;
  sortOrder: number;
  updated: string;
}

export interface PublicShopPromotion {
  id: string;
  discountType: DiscountType;
  discountValue: number;
  scope: PromotionScope;
  categoryIds?: string[];
  productIds?: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  updated: string;
}

export interface PublicShopPaymentProvider {
  id: string;
  provider: PaymentProviderType;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  updated: string;
}

// ---------------------------------------------------------------------------
// Company identity — from the SEPARATE /connect/company webservices
// (readCompany → CompanyPublicDto, readCompanyAbout → AboutDto). The shop DTOs
// carry no name/tagline/address/contact, so all storefront identity comes from
// here. Mirrors me/backend/src/modules/company/company.dto.ts + about/about.dto.ts.
// ---------------------------------------------------------------------------

export interface Weblink {
  code: string;
  url: string;
}

export interface Weblinks {
  website: string;
  vrTour: unknown | null;
  weblinksItems: Weblink[];
}

export interface OpeningHourItem {
  weekday: string;
  from: string;
  to: string;
  message: string;
}

export interface OpeningHours {
  message: string;
  items: OpeningHourItem[];
}

export interface CompanyCoordinate {
  lat?: number;
  lng?: number;
}

export interface CompanyAddress {
  street?: string;
  streetNumber?: string;
  zip?: string;
  city?: string;
  state?: string;
  coordinate?: CompanyCoordinate | null;
}

/** GET /connect/company/:companyId → CompanyPublicDto. */
export interface PublicCompany {
  id: string;
  company: string;
  email: string;
  phone: string;
  weblinks: Weblinks | null;
  openingHours: OpeningHours | null;
  image: string;
  profileState: unknown | null;
  categories: string[];
  address: CompanyAddress | null;
  reviewPoints: number;
  favoritesCount: number;
}

export interface CompanyAboutItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  tags: string[];
}

/** GET /connect/company/about/:companyId → AboutDto. */
export interface CompanyAbout {
  companyId: string;
  description: string;
  items: CompanyAboutItem[];
}

/** Aggregate payload from GET /connect/shop, plus company identity. */
export interface PublicShopBundle {
  ownerId: string;
  shopId: string;
  settings: PublicShopSettings;
  categories: PublicShopCategory[];
  products: PublicShopProduct[];
  promotions: PublicShopPromotion[];
  paymentProviders: PublicShopPaymentProvider[];
  /** Real company identity, or null when the company webservice is unavailable. */
  company: PublicCompany | null;
  /** Real company "about" copy, or null when unavailable. */
  about: CompanyAbout | null;
}
