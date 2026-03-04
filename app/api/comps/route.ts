import { NextRequest, NextResponse } from "next/server";
import { getProperty, getSoldComps } from "@/lib/db/queries";
import { topComps } from "@/lib/comps/scoring";

export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get("propertyId");

  if (!propertyId) {
    return NextResponse.json(
      { data: null, error: "propertyId is required" },
      { status: 400 }
    );
  }

  const [{ data: property, error: propError }, { data: allComps, error: compsError }] =
    await Promise.all([getProperty(propertyId), getSoldComps()]);

  if (propError || !property) {
    return NextResponse.json(
      { data: null, error: propError ?? "Property not found" },
      { status: 404 }
    );
  }

  if (compsError || !allComps) {
    return NextResponse.json(
      { data: null, error: compsError ?? "Failed to load comps" },
      { status: 500 }
    );
  }

  const ranked = topComps(property, allComps, 7);

  return NextResponse.json({ data: ranked, error: null });
}
