import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProperty, getSoldComps } from "@/lib/db/queries";
import { topComps } from "@/lib/comps/scoring";
import { calculatePriceRange } from "@/lib/pricing/calculator";
import { OfferWizard } from "@/components/offer/OfferWizard";
import type { PriceRange } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { data } = await getProperty(params.id);
  if (!data) return { title: "Make an Offer — HomeIQ" };
  return {
    title: `Make an Offer: ${data.address} — HomeIQ`,
    description: `Step-by-step offer wizard for ${data.address}. TREC-based, plain language, no realtor needed.`,
  };
}

export default async function OfferPage({
  params,
}: {
  params: { id: string };
}) {
  const [{ data: property, error }, { data: allComps }] = await Promise.all([
    getProperty(params.id),
    getSoldComps(),
  ]);

  if (error || !property) notFound();

  // Pre-calculate a default price range from top comps so Step 1 has data
  let priceRange: PriceRange | null = null;
  try {
    const scored = topComps(property, allComps ?? [], 5);
    if (scored.length > 0) {
      priceRange = calculatePriceRange(property.sqft, scored);
    }
  } catch {
    // No comps available — Step 1 will fall back to free-text input only
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Link
            href={`/properties/${params.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to property
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground truncate">
            Make an Offer
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Make an Offer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{property.address}</span>{" "}
            · {property.city}, TX {property.zip}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            We&rsquo;ll walk you through each piece of a Texas real estate offer in
            plain language. The whole thing takes about 5 minutes.
          </p>
        </div>

        <OfferWizard property={property} priceRange={priceRange} />
      </main>
    </div>
  );
}
