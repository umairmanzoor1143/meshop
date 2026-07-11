import { NextResponse } from "next/server";
import { loadCompany, loadCompanyAbout } from "@/lib/connect";

// Real company identity + about copy from the /connect/company webservices.
// Returns { company, about } with either value null when the endpoint is
// unavailable — the storefront omits missing fields rather than inventing them.
export const revalidate = 60;

export async function GET() {
  const [company, about] = await Promise.all([loadCompany(), loadCompanyAbout()]);
  return NextResponse.json({ company, about });
}
