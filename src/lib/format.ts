import type { Currency } from "./types";

/** "CHF 12.90" — Swiss francs, always two decimals. */
export function formatMoney(amount: number, currency: Currency = "CHF"): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `${currency} ${n.toFixed(2)}`;
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

/** Fill "{rate}"/"{amount}" style placeholders in a translation string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
