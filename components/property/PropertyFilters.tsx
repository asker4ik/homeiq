"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "");
  const [beds, setBeds] = useState(searchParams.get("beds") ?? "");
  const [baths, setBaths] = useState(searchParams.get("baths") ?? "");
  const [zip, setZip] = useState(searchParams.get("zip") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (beds) params.set("beds", beds);
    if (baths) params.set("baths", baths);
    if (zip) params.set("zip", zip);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClear() {
    setPriceMin("");
    setPriceMax("");
    setBeds("");
    setBaths("");
    setZip("");
    router.push(pathname);
  }

  const hasFilters = priceMin || priceMax || beds || baths || zip;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Filter Properties</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Price min */}
        <div className="space-y-1.5">
          <Label htmlFor="priceMin">Min Price</Label>
          <Input
            id="priceMin"
            type="number"
            placeholder="$350,000"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
        </div>

        {/* Price max */}
        <div className="space-y-1.5">
          <Label htmlFor="priceMax">Max Price</Label>
          <Input
            id="priceMax"
            type="number"
            placeholder="$800,000"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>

        {/* Beds */}
        <div className="space-y-1.5">
          <Label htmlFor="beds">Min Beds</Label>
          <select
            id="beds"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Baths */}
        <div className="space-y-1.5">
          <Label htmlFor="baths">Min Baths</Label>
          <select
            id="baths"
            value={baths}
            onChange={(e) => setBaths(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
          </select>
        </div>

        {/* Zip */}
        <div className="space-y-1.5">
          <Label htmlFor="zip">Zip Code</Label>
          <Input
            id="zip"
            type="text"
            placeholder="78704"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" className="gap-2">
          <Search className="h-4 w-4" />
          Search
        </Button>
        {hasFilters && (
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear filters
          </Button>
        )}
      </div>
    </form>
  );
}
