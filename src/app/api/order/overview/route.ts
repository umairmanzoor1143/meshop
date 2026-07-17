import { NextResponse } from "next/server";
import { getOrderOverview } from "@/lib/connect";

// Guest order overview by the order:read JWT. Public — the token IS the capability.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 400 });
  try {
    return NextResponse.json(await getOrderOverview(token));
  } catch (err) {
    const status = (err as { status?: number }).status ?? 502;
    return NextResponse.json({ error: "overview_failed" }, { status });
  }
}
