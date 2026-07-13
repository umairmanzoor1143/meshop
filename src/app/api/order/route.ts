import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Server-only order placement. The public /connect surface is read-only, so the
// order goes to the me platform endpoint POST /shop/checkout/place-order, which
// requires an authenticated me-account (Bearer JWT). meshop holds ONE service
// account token (ME_ORDER_BEARER_TOKEN) and places every guest order as it; the
// real buyer is captured in the invoice/delivery addresses. The token stays
// server-side and never reaches the browser.

export const dynamic = "force-dynamic";

const BASE = (process.env.CONNECT_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
const BEARER = process.env.ME_ORDER_BEARER_TOKEN ?? "";
const SHOP_ID = process.env.CONNECT_SHOP_ID ?? "";
const OWNER_ID = process.env.CONNECT_OWNER_ID ?? ""; // backend derives vendor from the shop; sent for contract completeness
const ASSOCIATION_ID = process.env.ME_ORDER_ASSOCIATION_ID ?? "";

interface OrderItem {
  productId: string;
  variationId?: string;
  quantity: number;
  extras: { groupId: string; choiceId: string }[];
  userInputs: { fieldId: string; value: string }[];
}
interface OrderAddress {
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
interface OrderBody {
  items: OrderItem[];
  paymentProviderId: string;
  fulfillmentMode: string;
  deliveryType?: "STANDARD" | "PREMIUM";
  invoiceAddress: OrderAddress;
  deliveryAddress: OrderAddress;
  notes?: string;
}

export async function POST(req: Request) {
  if (!BEARER) {
    console.error("[api/order] ME_ORDER_BEARER_TOKEN is not configured");
    return NextResponse.json({ error: "order_not_configured" }, { status: 503 });
  }

  let body: OrderBody;
  try {
    body = (await req.json()) as OrderBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.items?.length) return NextResponse.json({ error: "empty_cart" }, { status: 400 });

  const placeOrderRequest = {
    idempotencyKey: randomUUID(),
    associationId: ASSOCIATION_ID,
    groups: [
      {
        shopId: SHOP_ID,
        ownerId: OWNER_ID,
        paymentProviderId: body.paymentProviderId,
        fulfillmentMode: body.fulfillmentMode,
        deliveryType: body.deliveryType,
        items: body.items.map((it) => ({
          productId: it.productId,
          variationId: it.variationId,
          quantity: it.quantity,
          extras: it.extras ?? [],
          userInputs: it.userInputs ?? [],
        })),
      },
    ],
    invoiceAddress: body.invoiceAddress,
    deliveryAddress: body.deliveryAddress,
    notes: body.notes || undefined,
  };

  const res = await fetch(`${BASE}/shop/checkout/place-order`, {
    method: "POST",
    // Bearer only — NOT connect-token: isAuth short-circuits on a connect token
    // and would skip the account the place-order controller needs.
    headers: { authorization: `Bearer ${BEARER}`, "content-type": "application/json" },
    body: JSON.stringify(placeOrderRequest),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`[api/order] place-order -> ${res.status}: ${text}`);
    let message = "order_failed";
    try {
      message = (JSON.parse(text).message as string) || message;
    } catch {
      /* keep default */
    }
    return NextResponse.json({ error: "order_failed", message }, { status: res.status });
  }

  // { bundleId, accessToken, hubUrl, hubApiUrl, orderIds }
  return NextResponse.json(JSON.parse(text));
}
