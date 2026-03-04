import type { SoldComp, PriceRange } from "@/types";

/**
 * Calculates a price range for a subject property from a set of approved comps.
 *
 * Strategy:
 *   1. Compute $/sqft for each comp weighted by similarity score
 *   2. Derive weighted median $/sqft
 *   3. Apply to subject sqft → fair value
 *   4. Conservative = fair - 3%, Aggressive = fair + 4%
 *
 * The buyer sees conservative/fair/aggressive — we never tell them what to bid.
 */
export function calculatePriceRange(
  subjectSqft: number,
  comps: SoldComp[]
): PriceRange {
  if (comps.length === 0) {
    throw new Error("Cannot calculate price range: no comps provided");
  }

  // Weight each comp's $/sqft by its similarity score (default 50 if not scored)
  const weighted = comps.map((c) => ({
    ppsf: c.salePrice / c.sqft,
    weight: c.similarityScore ?? 50,
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  const weightedPpsf =
    weighted.reduce((sum, w) => sum + w.ppsf * w.weight, 0) / totalWeight;

  const fairValue = Math.round((weightedPpsf * subjectSqft) / 1000) * 1000;
  const conservative = Math.round((fairValue * 0.97) / 1000) * 1000;
  const aggressive = Math.round((fairValue * 1.04) / 1000) * 1000;

  return {
    conservative,
    fair: fairValue,
    aggressive,
    pricePerSqft: Math.round(weightedPpsf),
    compCount: comps.length,
  };
}
