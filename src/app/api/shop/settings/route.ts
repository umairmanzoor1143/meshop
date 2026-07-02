import { NextResponse } from "next/server";
import { loadSettings } from "@/lib/connect";

export const revalidate = 60;

export async function GET() {
  try {
    return NextResponse.json(await loadSettings());
  } catch (err) {
    console.error("[api/shop/settings] failed:", err);
    return NextResponse.json({ error: "settings_unavailable" }, { status: 502 });
  }
}
