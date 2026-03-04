import { NextRequest, NextResponse } from "next/server";
import { getProperties } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const beds = searchParams.get("beds");
  const baths = searchParams.get("baths");
  const zip = searchParams.get("zip");
  const status = searchParams.get("status");

  const { data, error } = await getProperties({
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    bedsMin: beds ? Number(beds) : undefined,
    bathsMin: baths ? Number(baths) : undefined,
    zip: zip ?? undefined,
    status: status ?? undefined,
  });

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}
