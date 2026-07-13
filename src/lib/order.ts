"use client";

import type { FulfillmentMode } from "./types";

// Client-side order submission. Posts to our own /api/order route handler, which
// forwards to the me platform place-order endpoint with the server-held service
// account token. On success the backend returns the order bundle + a ready-built
// hub URL where the buyer can view and pay the order.

export interface OrderAddressInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  street: string;
  streetNumber: string;
  zip: string;
  city: string;
  country: string;
}

export interface OrderItemInput {
  productId: string;
  variationId?: string;
  quantity: number;
  extras: { groupId: string; choiceId: string }[];
  userInputs: { fieldId: string; value: string }[];
}

export interface PlaceOrderInput {
  items: OrderItemInput[];
  paymentProviderId: string;
  fulfillmentMode: FulfillmentMode;
  deliveryType?: "STANDARD" | "PREMIUM";
  invoiceAddress: OrderAddressInput;
  deliveryAddress: OrderAddressInput;
  notes?: string;
}

export interface PlaceOrderResult {
  bundleId: string;
  accessToken: string;
  hubUrl: string;
  hubApiUrl: string;
  orderIds: string[];
}

/** Persisted for the confirmation page (survives the redirect). */
export interface LastOrder {
  bundleId: string;
  grand: number;
  paymentName: string;
  fulfillment: FulfillmentMode;
  email: string;
  hubUrl: string;
}

const KEY = "meshop.lastOrder";

export class OrderError extends Error {}

export async function submitOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const res = await fetch("/api/order", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new OrderError((data as { message?: string }).message || `order_failed_${res.status}`);
  }
  return data as PlaceOrderResult;
}

export function rememberLastOrder(order: LastOrder): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

export function loadLastOrder(): LastOrder | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LastOrder) : null;
  } catch {
    return null;
  }
}
