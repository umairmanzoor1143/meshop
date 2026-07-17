import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { placeGuestOrder } from "@/lib/connect";

// Server-only guest order placement. Forwards to the e-shop guest checkout
// (POST {SHOP_BASE}/checkout/place-order), authenticated by the server-held
// connect-token — the buyer is a guest, no account/Bearer token needed. The
// backend returns { bundleId, accessToken (order:read JWT), hubUrl, ... } which
// the shopper uses to view and pay the order.

export const dynamic = "force-dynamic";

const SHOP_ID = process.env.CONNECT_SHOP_ID ?? "";

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
  let body: OrderBody;
  try {
    body = (await req.json()) as OrderBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.items?.length) return NextResponse.json({ error: "empty_cart" }, { status: 400 });

  const placeOrderRequest = {
    idempotencyKey: randomUUID(),
    // The backend derives the vendor from the shop and resolves any association
    // itself, so these are left empty (kept only because the contract lists them).
    associationId: "",
    groups: [
      {
        shopId: SHOP_ID,
        ownerId: "",
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

  try {
    const result = await placeGuestOrder(placeOrderRequest);
    return NextResponse.json(result);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 502;
    const message = err instanceof Error ? err.message : "order_failed";
    console.error(`[api/order] place-order failed (${status}): ${message}`);
    return NextResponse.json({ error: "order_failed", message }, { status });
  }
}
