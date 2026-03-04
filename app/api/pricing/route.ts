import { NextRequest, NextResponse } from "next/server";
import { getProperty, getSoldComps } from "@/lib/db/queries";
import { annotateComp } from "@/lib/comps/scoring";
import { calculatePriceRange } from "@/lib/pricing/calculator";

interface RequestBody {
  propertyId: string;
  compIds: string[];
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { propertyId, compIds } = body;

  if (!propertyId || !Array.isArray(compIds) || compIds.length === 0) {
    return NextResponse.json(
      { data: null, error: "propertyId and at least one compId are required" },
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

  const idSet = new Set(compIds);
  const selectedComps = allComps
    .filter((c) => idSet.has(c.id))
    .map((c) => annotateComp(property, c));

  if (selectedComps.length === 0) {
    return NextResponse.json(
      { data: null, error: "None of the provided comp IDs were found" },
      { status: 400 }
    );
  }

  try {
    const priceRange = calculatePriceRange(property.sqft, selectedComps);
    return NextResponse.json({ data: priceRange, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calculation failed";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
