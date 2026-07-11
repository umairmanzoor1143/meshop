import type { PublicCompany, CompanyAbout } from "./types";
import { imageUrl } from "./image";

// Derive storefront identity strictly from the /connect/company webservices.
// Every helper returns null/empty when the underlying real field is absent — the
// UI then omits it. Nothing here invents a name, tagline, address, or contact.

/** Real company name, or null. */
export function companyName(company: PublicCompany | null): string | null {
  const n = company?.company?.trim();
  return n ? n : null;
}

/** Up-to-two-letter monogram derived from the real company name; null if no name. */
export function companyMark(company: PublicCompany | null): string | null {
  const name = companyName(company);
  if (!name) return null;
  const words = name.split(/\s+/).filter(Boolean);
  const letters = (words.length >= 2 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
  return letters || null;
}

/** Resolved logo URL from the real company image key, or null. */
export function companyLogoUrl(company: PublicCompany | null): string | null {
  return imageUrl(company?.image);
}

/** Single-line postal address from real address fields, or null when none are set. */
export function companyAddressLine(company: PublicCompany | null): string | null {
  const a = company?.address;
  if (!a) return null;
  const street = [a.street, a.streetNumber].filter(Boolean).join(" ").trim();
  const town = [a.zip, a.city].filter(Boolean).join(" ").trim();
  const line = [street, town].filter(Boolean).join(", ");
  return line || null;
}

/** Real city, or null. */
export function companyCity(company: PublicCompany | null): string | null {
  const c = company?.address?.city?.trim();
  return c ? c : null;
}

/** Real contact email, or null. */
export function companyEmail(company: PublicCompany | null): string | null {
  const e = company?.email?.trim();
  return e ? e : null;
}

/** Real contact phone, or null. */
export function companyPhone(company: PublicCompany | null): string | null {
  const p = company?.phone?.trim();
  return p ? p : null;
}

export interface SocialLink {
  code: string;
  url: string;
}

/** Real social/web links from company.weblinks, or []. */
export function companySocialLinks(company: PublicCompany | null): SocialLink[] {
  const links: SocialLink[] = [];
  const wl = company?.weblinks;
  if (!wl) return links;
  if (wl.website?.trim()) links.push({ code: "website", url: wl.website.trim() });
  for (const item of wl.weblinksItems ?? []) {
    if (item.url?.trim()) links.push({ code: item.code, url: item.url.trim() });
  }
  return links;
}

/** Real "about" intro paragraph (first non-empty line), or null. */
export function companyAboutIntro(about: CompanyAbout | null): string | null {
  const d = about?.description?.trim();
  if (!d) return null;
  const firstBlock = d.split(/\n{2,}/)[0]?.trim();
  return firstBlock || d;
}

/** Real opening-hours free-text message, or null. */
export function companyOpeningMessage(company: PublicCompany | null): string | null {
  const m = company?.openingHours?.message?.trim();
  return m ? m : null;
}

/**
 * Real pickup detail line composed from the company's own address + opening-hours
 * message. Returns null when neither is set — never a fabricated address or hours.
 */
export function companyPickupInfo(company: PublicCompany | null): string | null {
  const parts = [companyAddressLine(company), companyOpeningMessage(company)].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
