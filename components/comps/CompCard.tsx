import { BedDouble, Bath, Maximize2, MapPin, CheckSquare, Square } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import type { SoldComp } from "@/types";

interface Props {
  comp: SoldComp;
  isSelected: boolean;
  onToggle: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-green-100 text-green-800"
      : score >= 50
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {score} match
    </span>
  );
}

export function CompCard({ comp, isSelected, onToggle }: Props) {
  const pricePerSqft = comp.pricePerSqft ?? Math.round(comp.salePrice / comp.sqft);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-xl border transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card opacity-60 hover:opacity-80"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="mt-0.5 shrink-0 text-primary">
            {isSelected ? (
              <CheckSquare className="h-5 w-5" />
            ) : (
              <Square className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {comp.address}
                </p>
                <p className="text-xs text-muted-foreground">
                  {comp.city}, TX {comp.zip}
                </p>
              </div>
              {comp.similarityScore !== undefined && (
                <ScoreBadge score={comp.similarityScore} />
              )}
            </div>

            {/* Price + date */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                {formatPrice(comp.salePrice)}
              </span>
              <span className="text-xs text-muted-foreground">
                sold {formatDate(comp.saleDate)}
              </span>
            </div>

            {/* Stats row */}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BedDouble className="h-3 w-3" />
                {comp.beds} bd
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-3 w-3" />
                {comp.baths} ba
              </span>
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" />
                {comp.sqft.toLocaleString()} sqft
              </span>
              <span className="font-medium text-foreground">
                ${pricePerSqft}/sqft
              </span>
              {comp.distanceMiles !== undefined && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {comp.distanceMiles < 0.1
                    ? "< 0.1 mi"
                    : `${comp.distanceMiles} mi`}
                </span>
              )}
            </div>

            {/* Key differences */}
            {comp.keyDifferences && comp.keyDifferences.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {comp.keyDifferences.map((diff) => (
                  <span
                    key={diff}
                    className="rounded-full border bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {diff}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
