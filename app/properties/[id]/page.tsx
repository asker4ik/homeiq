import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Maximize2,
  Home,
  Calendar,
  Clock,
  TrendingDown,
  AlertTriangle,
  Building2,
  GraduationCap,
} from "lucide-react";
import { getProperty } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdvisoryBrief } from "@/components/advisory/AdvisoryBrief";
import { formatPrice, formatDate, formatFeatureLabel } from "@/lib/utils";
import type { Metadata } from "next";

// Mapbox GL JS needs browser APIs — disable SSR
const PropertyMap = dynamic(
  () =>
    import("@/components/property/PropertyMap").then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-lg bg-muted animate-pulse" />
    ),
  }
);

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

const PRICE_EVENT_LABEL: Record<string, string> = {
  listed: "Listed",
  reduced: "Price Reduced",
  relisted: "Relisted",
  sold: "Sold",
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { data } = await getProperty(params.id);
  if (!data) return { title: "Property Not Found — HomeIQ" };
  return {
    title: `${data.address} — HomeIQ`,
    description: `${formatPrice(data.listPrice)} · ${data.beds} bd / ${data.baths} ba · ${data.sqft.toLocaleString()} sqft in ${data.city}, TX`,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: property, error } = await getProperty(params.id);

  if (error || !property) {
    notFound();
  }

  const pricePerSqft =
    property.sqft > 0 ? Math.round(property.listPrice / property.sqft) : null;

  const isReduced =
    property.priceHistory.length > 1 &&
    property.priceHistory[property.priceHistory.length - 1].event === "reduced";

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top nav */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/properties"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground truncate">
            {property.address}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero photo placeholder */}
        <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-8">
          <Home className="h-20 w-20 text-slate-300" />
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            <Badge variant={property.status as "active" | "pending" | "sold"}>
              {STATUS_LABEL[property.status]}
            </Badge>
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {TYPE_LABEL[property.propertyType]}
            </Badge>
            {isReduced && (
              <Badge className="bg-orange-500 text-white border-transparent">
                Price Reduced
              </Badge>
            )}
          </div>
          {property.floodZone !== "X" && (
            <div className="absolute bottom-4 left-4">
              <Badge variant="flood" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Flood Zone {property.floodZone}
              </Badge>
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: main content ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title block */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {property.address}
              </h1>
              <p className="text-muted-foreground mt-0.5">
                {property.city}, {property.state} {property.zip}
              </p>

              {/* Quick stats row */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" />
                  <strong className="text-foreground">{property.beds}</strong>{" "}
                  bedrooms
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" />
                  <strong className="text-foreground">{property.baths}</strong>{" "}
                  bathrooms
                </span>
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="h-4 w-4" />
                  <strong className="text-foreground">
                    {property.sqft.toLocaleString()}
                  </strong>{" "}
                  sqft
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <strong className="text-foreground">
                    {property.daysOnMarket}
                  </strong>{" "}
                  days on market
                </span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {property.description && (
              <section>
                <h2 className="text-base font-semibold text-foreground mb-2">
                  About this home
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </section>
            )}

            {/* Full specs grid */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">
                Property details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Year Built", value: property.yearBuilt },
                  {
                    label: "Lot Size",
                    value:
                      property.lotSqft > 0
                        ? `${property.lotSqft.toLocaleString()} sqft`
                        : "N/A (condo)",
                  },
                  {
                    label: "Price / sqft",
                    value: pricePerSqft ? `$${pricePerSqft}` : "—",
                  },
                  { label: "Bedrooms", value: property.beds },
                  { label: "Bathrooms", value: property.baths },
                  {
                    label: "Living Area",
                    value: `${property.sqft.toLocaleString()} sqft`,
                  },
                  { label: "Type", value: TYPE_LABEL[property.propertyType] },
                  { label: "Status", value: STATUS_LABEL[property.status] },
                  {
                    label: "Days on Market",
                    value: `${property.daysOnMarket} days`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg border bg-muted/40 px-4 py-3"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            {property.features.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-foreground mb-3">
                  Features
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((f) => (
                    <span
                      key={f}
                      className="rounded-full border bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {formatFeatureLabel(f)}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Price history */}
            {property.priceHistory.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  Price history
                </h2>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                          Event
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {property.priceHistory.map((event, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(event.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                event.event === "reduced"
                                  ? "text-orange-600 font-medium"
                                  : "text-foreground"
                              }
                            >
                              {PRICE_EVENT_LABEL[event.event] ?? event.event}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatPrice(event.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Tax history */}
            {property.taxHistory.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Tax history
                </h2>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                          Year
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                          Assessed Value
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                          Annual Tax
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {property.taxHistory.map((record) => (
                        <tr key={record.year} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium">{record.year}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {formatPrice(record.assessed)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatPrice(record.tax)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Permit history */}
            {property.permitHistory.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Permit history
                </h2>
                <div className="space-y-2">
                  {property.permitHistory.map((permit, i) => (
                    <div key={i} className="rounded-lg border bg-muted/20 px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium capitalize">
                          {permit.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(permit.date)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {permit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AI advisory brief — loaded client-side so it doesn't block the page */}
            <section>
              <AdvisoryBrief propertyId={property.id} />
            </section>
          </div>

          {/* ── Right: sidebar ───────────────────────────────── */}
          <aside className="flex flex-col gap-5">
            {/* Price card */}
            <div className="rounded-xl border bg-card shadow-sm p-5">
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(property.listPrice)}
              </p>
              {pricePerSqft && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  ${pricePerSqft} / sqft
                </p>
              )}

              <Separator className="my-4" />

              {/* Info badges */}
              <div className="space-y-2.5">
                {/* School zone */}
                {property.schoolZone && (
                  <div className="flex items-start gap-2.5">
                    <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">School Zone</p>
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {property.schoolZone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Flood zone */}
                <div className="flex items-start gap-2.5">
                  <AlertTriangle
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      property.floodZone === "X"
                        ? "text-muted-foreground"
                        : "text-red-500"
                    }`}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Flood Zone</p>
                    <p
                      className={`text-sm font-medium ${
                        property.floodZone === "X"
                          ? "text-foreground"
                          : "text-red-600"
                      }`}
                    >
                      {property.floodZone === "X"
                        ? "Zone X — Minimal risk"
                        : `Zone ${property.floodZone} — Flood insurance required`}
                    </p>
                  </div>
                </div>

                {/* HOA */}
                <div className="flex items-start gap-2.5">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">HOA</p>
                    <p className="text-sm font-medium text-foreground">
                      {property.hoaMonthly
                        ? `${formatPrice(property.hoaMonthly)}/month`
                        : "No HOA"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Primary CTA — Make an Offer */}
              <Link
                href={`/properties/${property.id}/offer`}
                className="block w-full rounded-lg bg-primary px-4 py-3.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Make an Offer
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                Step-by-step wizard · TREC form · ~5 minutes
              </p>

              <Separator className="my-3" />

              {/* Secondary CTA — Comp Analysis */}
              <Link
                href={`/properties/${property.id}/comps`}
                className="block w-full rounded-lg border bg-background px-4 py-2.5 text-center text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                View Comp Analysis
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                See what comparable homes sold for
              </p>
            </div>

            {/* Map */}
            {property.lat && property.lng && (
              <div className="relative rounded-xl overflow-hidden h-64 w-full">
                <PropertyMap
                  lat={property.lat}
                  lng={property.lng}
                  address={property.address}
                />
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
