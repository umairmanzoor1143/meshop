import { NextResponse } from "next/server";
import { requestOrderReauth, confirmOrderReauth } from "@/lib/connect";

// Guest order re-access via email 2FA:
//   { action: "request", orderReference, email }        -> emails a 6-digit code
//   { action: "confirm", orderReference, email, code }  -> returns an order:read token
export const dynamic = "force-dynamic";

interface Body {
  action: "request" | "confirm";
  orderReference?: string;
  email?: string;
  code?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const ref = (body.orderReference ?? "").trim();
  const email = (body.email ?? "").trim();

  try {
    if (body.action === "request") {
      // Always 202 { status: "accepted" } — never reveals whether the order exists.
      return NextResponse.json(await requestOrderReauth(ref, email));
    }
    if (body.action === "confirm") {
      const code = (body.code ?? "").trim();
      if (!ref || !email || !code) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
      return NextResponse.json(await confirmOrderReauth(ref, email, code));
    }
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 502;
    const message = err instanceof Error ? err.message : "reauth_failed";
    return NextResponse.json({ error: "reauth_failed", message }, { status });
  }
}
