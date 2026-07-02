// Presentation-only tenant branding. The public shop DTOs do not expose a shop
// display name / tagline / postal address, so this small map supplies them.
// Selected via NEXT_PUBLIC_TENANT. Palettes live in globals.css ([data-tenant]).

export type TenantId = "kuessnacht" | "alpina" | "leman";

export interface TenantMeta {
  id: TenantId;
  name: string;
  short: string;
  mark: string;
  tagline: string;
  contact: { street: string; zip: string; city: string; email: string };
  domain: string;
}

export const TENANTS: Record<TenantId, TenantMeta> = {
  kuessnacht: {
    id: "kuessnacht",
    name: "Marktplatz Küssnacht",
    short: "Küssnacht",
    mark: "MK",
    tagline: "Lokaler Genuss vom Rigi",
    contact: { street: "Seestrasse 14", zip: "6403", city: "Küssnacht am Rigi", email: "hallo@marktplatz-kuessnacht.ch" },
    domain: "shop.marktplatz-kuessnacht.ch",
  },
  alpina: {
    id: "alpina",
    name: "Alpina Bio Hof",
    short: "Alpina Bio",
    mark: "AB",
    tagline: "Bio-Hofladen · Graubünden",
    contact: { street: "Dorfstrasse 3", zip: "7000", city: "Chur", email: "hallo@alpina-bio.ch" },
    domain: "shop.alpina-bio.ch",
  },
  leman: {
    id: "leman",
    name: "Épicerie du Léman",
    short: "Léman",
    mark: "ÉL",
    tagline: "Saveurs du lac · Genève",
    contact: { street: "Quai du Mont-Blanc 5", zip: "1201", city: "Genève", email: "bonjour@epicerie-leman.ch" },
    domain: "shop.epicerie-leman.ch",
  },
};

export function getTenant(id?: string): TenantMeta {
  return TENANTS[(id as TenantId) in TENANTS ? (id as TenantId) : "kuessnacht"];
}

export const ACTIVE_TENANT: TenantId = ((): TenantId => {
  const id = process.env.NEXT_PUBLIC_TENANT as TenantId | undefined;
  return id && id in TENANTS ? id : "kuessnacht";
})();
