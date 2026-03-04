/**
 * All Claude prompts live here as exported functions.
 * They take typed inputs and return a prompt string.
 * API calls happen only in Next.js API routes — never client-side.
 */

import type { Property, SoldComp, PriceRange } from "@/types";

// ─── Advisory Brief ───────────────────────────────────────────────────────────

export function buildAdvisoryBriefPrompt(
  property: Property,
  comps: SoldComp[],
  priceRange: PriceRange
): string {
  const compSummary = comps
    .slice(0, 6)
    .map(
      (c) =>
        `• ${c.address} — ${c.beds}bd/${c.baths}ba, ${c.sqft.toLocaleString()} sqft, sold ${c.saleDate} for $${c.salePrice.toLocaleString()} ($${c.pricePerSqft}/sqft)`
    )
    .join("\n");

  return `You are HomeIQ, an AI assistant helping a first-time home buyer in Texas understand a property they are considering.

Write a plain-language advisory brief for the following property. The buyer has NO real estate experience. Avoid jargon. If you must use a term they might not know, explain it in plain English in parentheses.

---
PROPERTY
Address: ${property.address}, ${property.city}, TX ${property.zip}
Type: ${property.propertyType.replace("_", " ")}
Beds/Baths: ${property.beds}bd / ${property.baths}ba
Size: ${property.sqft.toLocaleString()} sqft | Lot: ${property.lotSqft.toLocaleString()} sqft
Year Built: ${property.yearBuilt}
List Price: $${property.listPrice.toLocaleString()}
Days on Market: ${property.daysOnMarket}
School Zone: ${property.schoolZone}
Flood Zone: ${property.floodZone}${property.floodZone === "AE" ? " ⚠️ HIGH RISK — flood insurance required" : " (minimal risk)"}
HOA: ${property.hoaMonthly ? `$${property.hoaMonthly}/month` : "None"}
Features: ${property.features.join(", ")}
Description: ${property.description}

PRICE HISTORY
${property.priceHistory.map((e) => `• ${e.date}: ${e.event} at $${e.price.toLocaleString()}`).join("\n")}

COMPARABLE SALES (approved by buyer)
${compSummary}

PRICE RANGE FROM COMPS
Conservative (below market): $${priceRange.conservative.toLocaleString()}
Fair market value: $${priceRange.fair.toLocaleString()}
Aggressive (competitive): $${priceRange.aggressive.toLocaleString()}
Average $/sqft from comps: $${priceRange.pricePerSqft}/sqft
---

Write the advisory brief in this exact JSON format:
{
  "summary": "2-3 sentence plain-language overview of the property and whether it seems like good value",
  "redFlags": ["array of 1-5 specific concerns the buyer should know about — be direct and honest"],
  "positives": ["array of 1-5 genuine strengths"],
  "neighborhoodContext": "1-2 sentences about the neighborhood, walkability, schools, or area trends",
  "biddingStrategy": "1-2 sentences on how this property is positioned vs the comp-based price range. Do NOT tell the buyer what to bid — give them context to make their own decision.",
  "questionsToAsk": ["array of 3-5 specific questions this buyer should ask at inspection or before making an offer"]
}

Return only the JSON — no preamble, no markdown fences.`;
}

// ─── Comp Reasoning ───────────────────────────────────────────────────────────

export function buildCompReasoningPrompt(
  property: Property,
  comp: SoldComp
): string {
  return `You are HomeIQ. Explain in 1-2 plain sentences why this sold home is or is not a good comparison for the subject property. Focus on similarities and differences that affect value. Be specific — mention sqft difference, location, age, or condition if relevant.

Subject: ${property.address} — ${property.beds}bd/${property.baths}ba, ${property.sqft.toLocaleString()} sqft, built ${property.yearBuilt}, listed at $${property.listPrice.toLocaleString()}
Comp: ${comp.address} — ${comp.beds}bd/${comp.baths}ba, ${comp.sqft.toLocaleString()} sqft, built ${comp.yearBuilt}, sold ${comp.saleDate} for $${comp.salePrice.toLocaleString()}
Distance: ${comp.distanceMiles ?? "unknown"} miles
Similarity score: ${comp.similarityScore ?? "N/A"}/100

Write 1-2 sentences only. Plain English.`;
}
