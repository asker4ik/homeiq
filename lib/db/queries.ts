import { supabase, supabaseAdmin } from "./client";
import type { Property, SoldComp, SavedProperty, Offer, ApiResponse } from "@/types";

// ─── Property Queries ─────────────────────────────────────────────────────────

export async function getProperties(filters?: {
  status?: string;
  zip?: string;
  bedsMin?: number;
  bathsMin?: number;
  priceMin?: number;
  priceMax?: number;
}): Promise<ApiResponse<Property[]>> {
  let query = supabase.from("properties").select("*");

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.zip) {
    query = query.eq("zip", filters.zip);
  }
  if (filters?.bedsMin) {
    query = query.gte("beds", filters.bedsMin);
  }
  if (filters?.bathsMin) {
    query = query.gte("baths", filters.bathsMin);
  }
  if (filters?.priceMin) {
    query = query.gte("list_price", filters.priceMin);
  }
  if (filters?.priceMax) {
    query = query.lte("list_price", filters.priceMax);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data.map(mapPropertyRow), error: null };
}

export async function getProperty(id: string): Promise<ApiResponse<Property>> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapPropertyRow(data), error: null };
}

// ─── Sold Comp Queries ────────────────────────────────────────────────────────

export async function getSoldComps(filters?: {
  zip?: string;
  beds?: number;
  propertyType?: string;
  saleDateAfter?: string;
}): Promise<ApiResponse<SoldComp[]>> {
  let query = supabase.from("sold_comps").select("*");

  if (filters?.zip) {
    query = query.eq("zip", filters.zip);
  }
  if (filters?.beds) {
    query = query.eq("beds", filters.beds);
  }
  if (filters?.propertyType) {
    query = query.eq("property_type", filters.propertyType);
  }
  if (filters?.saleDateAfter) {
    query = query.gte("sale_date", filters.saleDateAfter);
  }

  const { data, error } = await query.order("sale_date", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data.map(mapSoldCompRow), error: null };
}

// Returns all comps within the same zip code as the subject property,
// sold in the last 12 months — the raw candidate pool for scoring
export async function getCompsForProperty(property: Property): Promise<ApiResponse<SoldComp[]>> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

  return getSoldComps({
    zip: property.zip,
    saleDateAfter: twelveMonthsAgo.toISOString().split("T")[0],
  });
}

// ─── Offer Queries ────────────────────────────────────────────────────────────

export async function getOffer(id: string): Promise<ApiResponse<Offer>> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapOfferRow(data), error: null };
}

export async function upsertOffer(offer: Partial<Offer> & { userId: string; propertyId: string }): Promise<ApiResponse<Offer>> {
  const row = {
    id: offer.id,
    user_id: offer.userId,
    property_id: offer.propertyId,
    offer_price: offer.offerPrice,
    earnest_money: offer.earnestMoney,
    option_fee: offer.optionFee,
    option_days: offer.optionDays,
    closing_date: offer.closingDate,
    financing_contingency: offer.financingContingency,
    selected_comp_ids: offer.selectedCompIds,
    status: offer.status ?? "draft",
    trec_form_data: offer.trecFormData,
  };

  const { data, error } = await supabase
    .from("offers")
    .upsert(row)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapOfferRow(data), error: null };
}

// ─── Saved Property Queries ───────────────────────────────────────────────────

export async function getSavedProperties(userId: string): Promise<ApiResponse<SavedProperty[]>> {
  const { data, error } = await supabase
    .from("saved_properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data.map(mapSavedPropertyRow), error: null };
}

// ─── Admin: Seed Helpers ──────────────────────────────────────────────────────
// Used only by the seed script — bypasses RLS

export async function adminUpsertProperties(properties: Omit<Property, 'id' | 'createdAt'>[]): Promise<void> {
  const rows = properties.map((p) => ({
    address: p.address,
    city: p.city,
    state: p.state,
    zip: p.zip,
    lat: p.lat,
    lng: p.lng,
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft,
    lot_sqft: p.lotSqft,
    year_built: p.yearBuilt,
    list_price: p.listPrice,
    days_on_market: p.daysOnMarket,
    property_type: p.propertyType,
    status: p.status,
    school_zone: p.schoolZone,
    flood_zone: p.floodZone,
    hoa_monthly: p.hoaMonthly,
    photos: p.photos,
    description: p.description,
    features: p.features,
    price_history: p.priceHistory,
    tax_history: p.taxHistory,
    permit_history: p.permitHistory,
  }));

  const { error } = await supabaseAdmin.from("properties").insert(rows);
  if (error) throw new Error(`Failed to seed properties: ${error.message}`);
}

export async function adminUpsertSoldComps(comps: Omit<SoldComp, 'id' | 'createdAt' | 'similarityScore' | 'distanceMiles' | 'pricePerSqft' | 'keyDifferences'>[]): Promise<void> {
  const rows = comps.map((c) => ({
    address: c.address,
    city: c.city,
    zip: c.zip,
    lat: c.lat,
    lng: c.lng,
    beds: c.beds,
    baths: c.baths,
    sqft: c.sqft,
    lot_sqft: c.lotSqft,
    year_built: c.yearBuilt,
    sale_price: c.salePrice,
    sale_date: c.saleDate,
    property_type: c.propertyType,
    features: c.features,
  }));

  const { error } = await supabaseAdmin.from("sold_comps").insert(rows);
  if (error) throw new Error(`Failed to seed sold_comps: ${error.message}`);
}

// ─── Row Mappers (snake_case DB → camelCase TS) ───────────────────────────────

function mapPropertyRow(row: Record<string, any>): Property {
  return {
    id: row.id,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    lat: row.lat,
    lng: row.lng,
    beds: row.beds,
    baths: row.baths,
    sqft: row.sqft,
    lotSqft: row.lot_sqft,
    yearBuilt: row.year_built,
    listPrice: row.list_price,
    daysOnMarket: row.days_on_market,
    propertyType: row.property_type,
    status: row.status,
    schoolZone: row.school_zone,
    floodZone: row.flood_zone,
    hoaMonthly: row.hoa_monthly ?? null,
    photos: row.photos ?? [],
    description: row.description ?? "",
    features: row.features ?? [],
    priceHistory: row.price_history ?? [],
    taxHistory: row.tax_history ?? [],
    permitHistory: row.permit_history ?? [],
    createdAt: row.created_at,
  };
}

function mapSoldCompRow(row: Record<string, any>): SoldComp {
  return {
    id: row.id,
    address: row.address,
    city: row.city,
    zip: row.zip,
    lat: row.lat,
    lng: row.lng,
    beds: row.beds,
    baths: row.baths,
    sqft: row.sqft,
    lotSqft: row.lot_sqft,
    yearBuilt: row.year_built,
    salePrice: row.sale_price,
    saleDate: row.sale_date,
    propertyType: row.property_type,
    features: row.features ?? [],
    createdAt: row.created_at,
  };
}

function mapOfferRow(row: Record<string, any>): Offer {
  return {
    id: row.id,
    userId: row.user_id,
    propertyId: row.property_id,
    offerPrice: row.offer_price,
    earnestMoney: row.earnest_money,
    optionFee: row.option_fee,
    optionDays: row.option_days,
    closingDate: row.closing_date,
    financingContingency: row.financing_contingency,
    selectedCompIds: row.selected_comp_ids ?? [],
    status: row.status,
    trecFormData: row.trec_form_data,
    createdAt: row.created_at,
  };
}

function mapSavedPropertyRow(row: Record<string, any>): SavedProperty {
  return {
    id: row.id,
    userId: row.user_id,
    propertyId: row.property_id,
    notes: row.notes ?? "",
    createdAt: row.created_at,
  };
}
