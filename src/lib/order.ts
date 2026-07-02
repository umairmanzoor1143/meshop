"use client";

import type { FulfillmentMode, PaymentProviderType } from "./types";

// Client-side order handoff. There is NO public order-submission endpoint yet
// (Bruno's /connect surface is read-only), so placing an order currently just
// records a local receipt and shows the success page. When the backend adds an
// order POST, wire it inside submitOrder() and keep the rest of the flow.

export interface LastOrder {
  ref: string;
  grand: number;
  paymentType: PaymentProviderType;
  paymentName: string;
  fulfillment: FulfillmentMode;
  email: string;
}

const KEY = "meshop.lastOrder";

export function createOrderRef(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `MK-${year}-${n}`;
}

export async function submitOrder(order: LastOrder): Promise<LastOrder> {
  // TODO(bruno): POST to the order-creation endpoint once it exists, e.g.
  //   await fetch("/api/order", { method: "POST", body: JSON.stringify(payload) })
  // For now we persist locally so the confirmation page can render.
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
  return order;
}

export function loadLastOrder(): LastOrder | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LastOrder) : null;
  } catch {
    return null;
  }
}
