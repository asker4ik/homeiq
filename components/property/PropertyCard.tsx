import Link from "next/link";
import { Home, BedDouble, Bath, Maximize2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/types";

const STATUS_LABEL: Record<Property["status"], string> = {
  active: "Active",
  pending: "Pending",
  sold: "Sold",
};

const TYPE_LABEL: Record<Property["propertyType"], string> = {
  single_family: "Single Family",
  condo: "Condo",
  townhouse: "Townhouse",
};

interface Props {
  property: Property;
}

export function PropertyCard({ property }: Props) {
  const pricePerSqft =
    property.sqft > 0 ? Math.round(property.listPrice / property.sqft) : null;

  const hasPhotoReduction =
    property.priceHistory.length > 1 &&
    property.priceHistory[property.priceHistory.length - 1].event === "reduced";

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        {/* Photo / placeholder */}
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <Home className="h-14 w-14 text-slate-300" />
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge variant={property.status}>{STATUS_LABEL[property.status]}</Badge>
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs">
              {TYPE_LABEL[property.propertyType]}
            </Badge>
          </div>
          {/* Price reduced tag */}
          {hasPhotoReduction && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-orange-500 text-white border-transparent text-xs">
                Price Reduced
              </Badge>
            </div>
          )}
          {/* Days on market */}
          {property.daysOnMarket > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
              <Clock className="h-3 w-3" />
              {property.daysOnMarket}d
            </div>
          )}
          {/* Flood zone warning */}
          {property.floodZone !== "X" && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="flood">Flood Zone {property.floodZone}</Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl font-bold text-foreground">
              {formatPrice(property.listPrice)}
            </p>
            {pricePerSqft && (
              <p className="text-xs text-muted-foreground shrink-0">
                ${pricePerSqft}/sqft
              </p>
            )}
          </div>

          <p className="mt-1.5 text-sm font-medium text-foreground leading-snug">
            {property.address}
          </p>
          <p className="text-xs text-muted-foreground">
            {property.city}, {property.state} {property.zip}
          </p>

          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
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
    </Link>
  );
}
