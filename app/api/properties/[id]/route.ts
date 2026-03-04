import { NextRequest, NextResponse } from "next/server";
import { getProperty } from "@/lib/db/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await getProperty(params.id);

  if (error) {
    const status = error.includes("No rows") ? 404 : 500;
    return NextResponse.json({ data: null, error }, { status });
  }

  return NextResponse.json({ data, error: null });
}
