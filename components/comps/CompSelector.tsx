"use client";

import { useState, useMemo } from "react";
import { calculatePriceRange } from "@/lib/pricing/calculator";
import { CompCard } from "./CompCard";
import { PriceRangeBar } from "./PriceRangeBar";
import type { Property, SoldComp, PriceRange } from "@/types";

interface Props {
  property: Property;
  comps: SoldComp[]; // pre-scored via annotateComp/topComps
}

export function CompSelector({ property, comps }: Props) {
  // All comps selected by default
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(comps.map((c) => c.id))
  );

  function toggleComp(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(comps.map((c) => c.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  const selectedComps = useMemo(
    () => comps.filter((c) => selectedIds.has(c.id)),
    [comps, selectedIds]
  );

  const priceRange = useMemo<PriceRange | null>(() => {
    if (selectedComps.length === 0) return null;
    try {
      return calculatePriceRange(property.sqft, selectedComps);
    } catch {
      return null;
    }
  }, [property.sqft, selectedComps]);

  const allSelected = selectedIds.size === comps.length;
  const noneSelected = selectedIds.size === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Left: comp list (3/5 width on desktop) ── */}
      <div className="lg:col-span-3 space-y-3">
        {/* Controls header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Comparable Sales
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedIds.size} of {comps.length} selected
            </p>
          </div>
          <div className="flex gap-2">
            {!allSelected && (
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-primary hover:underline"
              >
                Select all
              </button>
            )}
            {!noneSelected && (
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs text-muted-foreground hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Comp cards */}
        {comps.map((comp) => (
          <CompCard
            key={comp.id}
            comp={comp}
            isSelected={selectedIds.has(comp.id)}
            onToggle={() => toggleComp(comp.id)}
          />
        ))}

        {comps.length === 0 && (
          <div className="rounded-xl border bg-card p-10 text-center">
            <p className="text-sm font-medium text-foreground">No comparable sales found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No sold comps are available for this property's area. Try checking
              nearby zip codes.
            </p>
          </div>
        )}
      </div>

      {/* ── Right: price range (2/5 width on desktop) ── */}
      <div className="lg:col-span-2">
        <div className="sticky top-20">
          <PriceRangeBar
            priceRange={priceRange}
            selectedCount={selectedIds.size}
          />
        </div>
      </div>
    </div>
  );
}
