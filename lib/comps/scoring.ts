import type { Property, SoldComp } from "@/types";

// ─── Haversine Distance ───────────────────────────────────────────────────────

function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function monthsSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return (
    (now.getFullYear() - then.getFullYear()) * 12 +
    (now.getMonth() - then.getMonth())
  );
}

// ─── Comp Similarity Score ────────────────────────────────────────────────────
// Returns a score 0–100. Higher = more comparable to the subject property.

export function scoreComp(subject: Property, comp: SoldComp): number {
  let score = 100;

  // Recency (most important — market conditions change)
  const months = monthsSince(comp.saleDate);
  if (months > 12) score -= 30;
  else if (months > 6) score -= 15;
  else if (months > 3) score -= 5;

  // Distance
  const miles = haversineDistance(subject, comp);
  if (miles > 1.0) score -= 25;
  else if (miles > 0.5) score -= 10;
  else if (miles > 0.25) score -= 3;

  // Size similarity (sqft)
  const sqftDiff = Math.abs(subject.sqft - comp.sqft) / subject.sqft;
  if (sqftDiff > 0.25) score -= 20;
  else if (sqftDiff > 0.15) score -= 10;
  else if (sqftDiff > 0.08) score -= 4;

  // Bed / bath match
  if (comp.beds !== subject.beds) score -= 8;
  if (comp.baths !== subject.baths) score -= 5;

  // Same zip code
  if (comp.zip !== subject.zip) score -= 10;

  // Property type match
  if (comp.propertyType !== subject.propertyType) score -= 15;

  return Math.max(0, score);
}

// ─── Annotate Comp with Computed Fields ──────────────────────────────────────

export function annotateComp(subject: Property, comp: SoldComp): SoldComp {
  const similarityScore = scoreComp(subject, comp);
  const distanceMiles = parseFloat(
    haversineDistance(subject, comp).toFixed(2)
  );
  const pricePerSqft = parseFloat((comp.salePrice / comp.sqft).toFixed(0));
  const keyDifferences = buildKeyDifferences(subject, comp);

  return {
    ...comp,
    similarityScore,
    distanceMiles,
    pricePerSqft,
    keyDifferences,
  };
}

function buildKeyDifferences(subject: Property, comp: SoldComp): string[] {
  const diffs: string[] = [];

  const bedDiff = comp.beds - subject.beds;
  if (bedDiff !== 0) {
    diffs.push(
      `${Math.abs(bedDiff)} ${Math.abs(bedDiff) === 1 ? "bed" : "beds"} ${bedDiff > 0 ? "more" : "fewer"}`
    );
  }

  const bathDiff = comp.baths - subject.baths;
  if (bathDiff !== 0) {
    diffs.push(
      `${Math.abs(bathDiff)} ${Math.abs(bathDiff) === 0.5 ? "half-bath" : "bath"} ${bathDiff > 0 ? "more" : "fewer"}`
    );
  }

  const sqftDiff = comp.sqft - subject.sqft;
  const sqftPct = Math.abs(sqftDiff) / subject.sqft;
  if (sqftPct >= 0.08) {
    diffs.push(
      `${Math.abs(sqftDiff).toLocaleString()} sqft ${sqftDiff > 0 ? "larger" : "smaller"}`
    );
  }

  const months = monthsSince(comp.saleDate);
  if (months > 6) {
    diffs.push(`Sold ${months} months ago`);
  }

  const miles = haversineDistance(subject, comp);
  if (miles > 0.5) {
    diffs.push(`${miles.toFixed(1)} miles away`);
  }

  if (comp.zip !== subject.zip) {
    diffs.push(`Different zip (${comp.zip})`);
  }

  if (comp.propertyType !== subject.propertyType) {
    diffs.push(`${comp.propertyType.replace("_", " ")} vs ${subject.propertyType.replace("_", " ")}`);
  }

  return diffs;
}

// ─── Sort + Filter Helpers ────────────────────────────────────────────────────

export function rankComps(subject: Property, comps: SoldComp[]): SoldComp[] {
  return comps
    .map((c) => annotateComp(subject, c))
    .sort((a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0));
}

export function topComps(subject: Property, comps: SoldComp[], n = 6): SoldComp[] {
  return rankComps(subject, comps).slice(0, n);
}
