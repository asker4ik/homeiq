import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BedDouble, Bath, Maximize2, Home } from "lucide-react";
import { getProperty, getSoldComps } from "@/lib/db/queries";
import { topComps } from "@/lib/comps/scoring";
import { CompSelector } from "@/components/comps/CompSelector";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { data } = await getProperty(params.id);
  if (!data) return { title: "Comp Analysis — HomeIQ" };
  return {
    title: `Comp Analysis: ${data.address} — HomeIQ`,
    description: `Review comparable sales and calculate a price range for ${data.address}.`,
  };
}

export default async function CompsPage({
  params,
}: {
  params: { id: string };
}) {
  const [{ data: property, error: propError }, { data: allComps, error: compsError }] =
    await Promise.all([getProperty(params.id), getSoldComps()]);

  if (propError || !property) {
    notFound();
  }

  const scoredComps = topComps(property, allComps ?? [], 7);

  const STATUS_LABEL: Record<string, string> = {
    active: "Active",
    pending: "Pending",
    sold: "Sold",
  };

  const TYPE_LABEL: Record<string, string> = {
    single_family: "Single Family",
    condo: "Condo",
    townhouse: "Townhouse",
  };

  const pricePerSqft =
    property.sqft > 0 ? Math.round(property.listPrice / property.sqft) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Link
            href={`/properties/${params.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to property
          </Link>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <span className="text-sm font-medium text-foreground hidden sm:inline truncate">
            Comp Analysis
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Subject property summary */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="bg-muted/30 border-b px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Subject Property
            </p>
          </div>
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Photo placeholder */}
            <div className="h-20 w-20 shrink-0 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Home className="h-8 w-8 text-slate-300" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge
                  variant={property.status as "active" | "pending" | "sold"}
                  className="text-xs"
                >
                  {STATUS_LABEL[property.status]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {TYPE_LABEL[property.propertyType]}
                </Badge>
              </div>
              <h1 className="text-base font-bold text-foreground leading-snug">
                {property.address}
              </h1>
              <p className="text-sm text-muted-foreground">
                {property.city}, {property.state} {property.zip}
              </p>
            </div>

            <Separator orientation="vertical" className="hidden sm:block h-16" />

            {/* Stats */}
            <div className="flex sm:flex-col gap-4 sm:gap-1 sm:text-right shrink-0">
              <div>
                <p className="text-xl font-bold text-foreground">
                  {formatPrice(property.listPrice)}
                </p>
                {pricePerSqft && (
                  <p className="text-xs text-muted-foreground">
                    ${pricePerSqft}/sqft asking
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground sm:justify-end">
                <span className="flex items-center gap-1">
                  <BedDouble className="h-3.5 w-3.5" />
                  {property.beds} bd
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5" />
                  {property.baths} ba
                </span>
                <span className="flex items-center gap-1">
                  <Maximize2 className="h-3.5 w-3.5" />
                  {property.sqft.toLocaleString()} sqft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm text-blue-900 leading-relaxed">
            <span className="font-semibold">How this works:</span> We found the{" "}
            {scoredComps.length} most comparable recent sales near this property.
            Each comp is scored based on size, distance, recency, and property
            type. Check or uncheck comps to include them in your price range
            calculation.{" "}
            <span className="font-medium">You control the inputs — we just do the math.</span>
          </p>
        </div>

        {/* Error state for comps */}
        {compsError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            Failed to load comparable sales: {compsError}
          </div>
        )}

        {/* Main comp selector */}
        <CompSelector property={property} comps={scoredComps} />
      </main>
    </div>
  );
}
