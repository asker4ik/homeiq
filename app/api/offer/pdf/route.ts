import { NextRequest } from "next/server";
import { fillTrecForm } from "@/lib/pdf/fillTrecForm";
import type { TrecFormData } from "@/types";

export async function POST(req: NextRequest) {
  let trecFormData: TrecFormData;
  try {
    trecFormData = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!trecFormData.offerPrice || trecFormData.offerPrice <= 0) {
    return new Response("offerPrice is required", { status: 400 });
  }

  try {
    const pdfBytes = Buffer.from(await fillTrecForm(trecFormData));
    const address = trecFormData.propertyAddress
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40);

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="offer-${address}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/offer/pdf] PDF generation failed:", err);
    return new Response("PDF generation failed", { status: 500 });
  }
}
