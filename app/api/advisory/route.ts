import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getProperty, getSoldComps } from "@/lib/db/queries";
import { annotateComp, topComps } from "@/lib/comps/scoring";
import { calculatePriceRange } from "@/lib/pricing/calculator";
import { buildAdvisoryBriefPrompt } from "@/lib/ai/prompts";

interface RequestBody {
  propertyId: string;
  compIds?: string[]; // optional — uses top comps automatically if omitted
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

  if (!propertyId) {
    return NextResponse.json(
      { data: null, error: "propertyId is required" },
      { status: 400 }
    );
  }

  // Fetch property + all sold comps in parallel
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

  // Score + select comps
  const scoredComps =
    compIds && compIds.length > 0
      ? (() => {
          const idSet = new Set(compIds);
          return allComps
            .filter((c) => idSet.has(c.id))
            .map((c) => annotateComp(property, c));
        })()
      : topComps(property, allComps, 5);

  if (scoredComps.length === 0) {
    return NextResponse.json(
      { data: null, error: "No comparable sales found for this property" },
      { status: 422 }
    );
  }

  const priceRange = calculatePriceRange(property.sqft, scoredComps);
  const prompt = buildAdvisoryBriefPrompt(property, scoredComps, priceRange);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
