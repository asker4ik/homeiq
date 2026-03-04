// ─── Supporting Types ────────────────────────────────────────────────────────

export interface PriceEvent {
  date: string;       // ISO date string
  price: number;
  event: 'listed' | 'reduced' | 'relisted' | 'sold';
}

export interface TaxRecord {
  year: number;
  assessed: number;
  tax: number;
}

export interface PermitRecord {
  date: string;       // ISO date string
  type: string;       // e.g. 'remodel', 'addition', 'pool', 'fence'
  description: string;
}

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft: number;
  yearBuilt: number;
  listPrice: number;
  daysOnMarket: number;
  propertyType: 'single_family' | 'condo' | 'townhouse';
  status: 'active' | 'pending' | 'sold';
  schoolZone: string;
  floodZone: string;        // e.g. 'X', 'AE', 'none'
  hoaMonthly: number | null;
  photos: string[];
  description: string;
  features: string[];
  priceHistory: PriceEvent[];
  taxHistory: TaxRecord[];
  permitHistory: PermitRecord[];
  createdAt: string;
}

export interface SoldComp {
  id: string;
  address: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft: number;
  yearBuilt: number;
  salePrice: number;
  saleDate: string;         // ISO date string
  propertyType: 'single_family' | 'condo' | 'townhouse';
  features: string[];
  createdAt: string;
  // Computed fields (populated after scoring)
  similarityScore?: number;
  distanceMiles?: number;
  pricePerSqft?: number;
  keyDifferences?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  buyerProfile: BuyerProfile | null;
  createdAt: string;
}

export interface SavedProperty {
  id: string;
  userId: string;
  propertyId: string;
  notes: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  userId: string;
  propertyId: string;
  offerPrice: number;
  earnestMoney: number;
  optionFee: number;
  optionDays: number;
  closingDate: string;      // ISO date string
  financingContingency: boolean;
  selectedCompIds: string[];
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  trecFormData: TrecFormData;
  createdAt: string;
}

// ─── Derived / Computed Types ─────────────────────────────────────────────────

export interface PriceRange {
  conservative: number;   // below market — motivated offer
  fair: number;           // at market
  aggressive: number;     // above market — competitive
  pricePerSqft: number;
  compCount: number;
}

export interface AdvisoryBrief {
  summary: string;
  redFlags: string[];
  positives: string[];
  neighborhoodContext: string;
  biddingStrategy: string;
  questionsToAsk: string[];
}

// ─── Profile / Preference Types ───────────────────────────────────────────────

export interface BuyerProfile {
  budget: number;
  bedsMin: number;
  bathsMin: number;
  priorities: string[];
  dealbreakers: string[];
}

// ─── TREC Form ────────────────────────────────────────────────────────────────

export interface TrecFormData {
  // Section 1 — Parties
  buyerName: string;
  sellerName: string;
  // Section 2 — Property
  propertyAddress: string;
  legalDescription: string;
  // Section 3 — Sales Price
  offerPrice: number;
  cashDown: number;
  financingAmount: number;
  // Section 4 — License Holder Disclosure
  buyerRepresented: boolean;
  // Section 5 — Earnest Money
  earnestMoney: number;
  earnestMoneyHolder: string;   // usually title company name
  // Section 6 — Title Policy
  titlePolicyPaidBy: 'buyer' | 'seller';
  // Section 9 — Closing
  closingDate: string;
  possessionDate: string;
  // Section 23 — Option Period
  optionFee: number;
  optionDays: number;
  // Section 22 — Settlement and Other Expenses
  financingContingency: boolean;
  // Catch-all for additional fields
  additionalProvisions: string;
}

// ─── API Response Shape ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
