import { formatPrice } from "@/lib/utils";
import type { PriceRange } from "@/types";

interface Props {
  priceRange: PriceRange | null;
  selectedCount: number;
}

const TIER_INFO = [
  {
    key: "conservative" as const,
    label: "Conservative",
    color: "text-blue-600",
    dotColor: "bg-blue-500",
    lineColor: "bg-blue-200",
    desc: "Below market — motivates a quick sale. Use when you have flexibility on timing.",
  },
  {
    key: "fair" as const,
    label: "Fair Market",
    color: "text-emerald-600",
    dotColor: "bg-emerald-500",
    lineColor: "bg-emerald-200",
    desc: "At market value based on recent comp sales. The most defensible offer price.",
  },
  {
    key: "aggressive" as const,
    label: "Aggressive",
    color: "text-orange-600",
    dotColor: "bg-orange-500",
    lineColor: "bg-orange-200",
    desc: "Above market — signals serious intent. Use in a competitive multiple-offer situation.",
  },
];

export function PriceRangeBar({ priceRange, selectedCount }: Props) {
  if (selectedCount === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-sm font-medium text-foreground">Select at least one comp</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Check a comparable sale on the left to see your price range.
        </p>
      </div>
    );
  }

  if (!priceRange) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  const { conservative, fair, aggressive, pricePerSqft, compCount } = priceRange;
  const rangeSpan = aggressive - conservative;

  // Positions as % within the conservative–aggressive span
  const fairPct =
    rangeSpan > 0 ? ((fair - conservative) / rangeSpan) * 100 : 50;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/30 px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Price Range Analysis</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Based on{" "}
          <span className="font-medium text-foreground">{compCount}</span>{" "}
          {compCount === 1 ? "comp" : "comps"} ·{" "}
          <span className="font-medium text-foreground">${pricePerSqft}</span>/sqft avg
        </p>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Visual bar */}
        <div className="relative">
          {/* Track */}
          <div className="mx-2 h-2 rounded-full bg-gradient-to-r from-blue-200 via-emerald-200 to-orange-200" />

          {/* Conservative dot — left */}
          <div
            className="absolute -top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow"
            style={{ left: "0%" }}
          />
          {/* Fair dot — proportional */}
          <div
            className="absolute -top-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow"
            style={{ left: `calc(${fairPct}% - 8px)` }}
          />
          {/* Aggressive dot — right */}
          <div
            className="absolute -top-1 h-4 w-4 rounded-full bg-orange-500 border-2 border-white shadow"
            style={{ right: "0%" }}
          />
        </div>

        {/* Tier cards */}
        <div className="space-y-3">
          {TIER_INFO.map(({ key, label, color, dotColor, desc }) => (
            <div key={key} className="flex items-start gap-3">
              <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${dotColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-xs font-medium ${color}`}>{label}</span>
                  <span className="text-base font-bold text-foreground tabular-nums">
                    {formatPrice(priceRange[key])}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-2.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">You decide what to offer.</span>{" "}
            This range is based on the comps you approved — it reflects market data, not a
            recommendation. Only you can weigh your personal priorities and budget.
          </p>
        </div>

        {/* Phase 4 CTA placeholder */}
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center">
          <p className="text-sm font-medium text-primary">AI Advisory Brief</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Coming in Phase 4 — full market analysis, red flags, and bidding strategy from Claude.
          </p>
        </div>
      </div>
    </div>
  );
}
