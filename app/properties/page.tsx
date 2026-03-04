import { Suspense } from "react";
import { Home } from "lucide-react";
import { getProperties } from "@/lib/db/queries";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";

interface SearchParams {
  priceMin?: string;
  priceMax?: string;
  beds?: string;
  baths?: string;
  zip?: string;
}

export const metadata = {
  title: "Browse Homes — HomeIQ",
  description: "Search active listings in Texas. Filter by price, beds, baths, and zip code.",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { data: properties, error } = await getProperties({
    priceMin: searchParams.priceMin ? Number(searchParams.priceMin) : undefined,
    priceMax: searchParams.priceMax ? Number(searchParams.priceMax) : undefined,
    bedsMin: searchParams.beds ? Number(searchParams.beds) : undefined,
    bathsMin: searchParams.baths ? Number(searchParams.baths) : undefined,
    zip: searchParams.zip,
  });

  const hasFilters =
    searchParams.priceMin ||
    searchParams.priceMax ||
    searchParams.beds ||
    searchParams.baths ||
    searchParams.zip;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-3">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">HomeIQ</span>
          <span className="text-muted-foreground text-sm hidden sm:inline">
            / Browse Homes
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        {/* Filters — wrapped in Suspense because useSearchParams requires it */}
        <Suspense fallback={<div className="h-32 rounded-xl border bg-card animate-pulse" />}>
          <PropertyFilters />
        </Suspense>

        {/* Results header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {error ? (
              <span className="text-destructive">Failed to load properties</span>
            ) : (
              <>
                <span className="font-semibold text-foreground">
                  {properties?.length ?? 0}
                </span>{" "}
                {(properties?.length ?? 0) === 1 ? "home" : "homes"} found
                {hasFilters && " matching your filters"}
              </>
            )}
          </p>
        </div>

        {/* Grid */}
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : !properties || properties.length === 0 ? (
          <div className="rounded-xl border bg-card p-16 text-center">
            <Home className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">No homes found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
