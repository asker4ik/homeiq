# HomeIQ — Real Estate Platform Architecture

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for property pages, API routes, great for SEO later |
| Language | TypeScript | You'll thank yourself when the data model gets complex |
| Styling | Tailwind + shadcn/ui | Fast, clean, no custom CSS rabbit holes |
| Database | Supabase (Postgres) | Free tier, great for structured property/comp data, built-in auth |
| AI | Anthropic Claude API | Advisory briefs, comp reasoning, offer guidance |
| Maps | Mapbox GL JS | Better than Google for custom property layers, free tier generous |
| Auth | Supabase Auth | Built in, handles user sessions for saved properties / offers |
| E-sign (Phase 3) | DocuSign API or Docuseal (open source) | Docuseal is free to self-host |
| Hosting | Vercel | Zero config with Next.js |

---

## Folder Structure

```
homeiq/
├── app/
│   ├── page.tsx                        # Landing / search
│   ├── properties/
│   │   ├── page.tsx                    # Search results list
│   │   └── [id]/
│   │       ├── page.tsx                # Property detail page
│   │       ├── comps/
│   │       │   └── page.tsx            # Comp selector view
│   │       └── offer/
│   │           └── page.tsx            # Offer workflow
│   ├── dashboard/
│   │   └── page.tsx                    # Buyer dashboard (saved, active offers)
│   └── api/
│       ├── properties/
│       │   ├── route.ts                # List/search properties
│       │   └── [id]/route.ts           # Single property
│       ├── comps/
│       │   └── route.ts                # Comp scoring + recommendations
│       ├── advisory/
│       │   └── route.ts                # Claude-powered property brief
│       ├── pricing/
│       │   └── route.ts                # Price range calc from comp set
│       └── offer/
│           └── route.ts                # Offer document generation
│
├── components/
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetail.tsx
│   │   ├── PropertyMap.tsx
│   │   └── PhotoGallery.tsx
│   ├── comps/
│   │   ├── CompSelector.tsx            # The interactive comp UI
│   │   ├── CompCard.tsx
│   │   └── PriceRangeBar.tsx           # Live updating price range
│   ├── advisory/
│   │   ├── AdvisoryBrief.tsx           # AI-generated brief display
│   │   ├── NeighborhoodAnalysis.tsx
│   │   └── BiddingStrategy.tsx
│   ├── offer/
│   │   ├── OfferWizard.tsx             # Step-by-step offer form
│   │   ├── TRECFormField.tsx           # Form field with plain-language tooltip
│   │   └── OfferSummary.tsx
│   └── ui/                             # shadcn components live here
│
├── lib/
│   ├── db/
│   │   ├── schema.ts                   # TypeScript types mirroring DB schema
│   │   └── queries.ts                  # Supabase query functions
│   ├── comps/
│   │   └── scoring.ts                  # Comp similarity scoring algorithm
│   ├── pricing/
│   │   └── calculator.ts               # Price range logic from comp set
│   ├── ai/
│   │   └── prompts.ts                  # All Claude prompts in one place
│   └── data/
│       └── seed.ts                     # Placeholder property + comp data
│
├── types/
│   └── index.ts                        # Shared TypeScript interfaces
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql      # DB schema
```

---

## Database Schema

```sql
-- Properties
create table properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  city text not null,
  state text default 'TX',
  zip text not null,
  lat decimal,
  lng decimal,
  beds int,
  baths decimal,
  sqft int,
  lot_sqft int,
  year_built int,
  list_price int,
  days_on_market int,
  property_type text,        -- 'single_family', 'condo', 'townhouse'
  status text,               -- 'active', 'pending', 'sold'
  school_zone text,
  flood_zone text,
  hoa_monthly int,
  photos text[],             -- array of image URLs
  description text,
  features text[],           -- ['pool', 'garage_2', 'updated_kitchen']
  price_history jsonb,       -- [{date, price, event}]
  tax_history jsonb,         -- [{year, assessed, tax}]
  permit_history jsonb,      -- [{date, type, description}]
  created_at timestamptz default now()
);

-- Sold comps (separate table — these are closed sales)
create table sold_comps (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  city text not null,
  zip text not null,
  lat decimal,
  lng decimal,
  beds int,
  baths decimal,
  sqft int,
  lot_sqft int,
  year_built int,
  sale_price int,
  sale_date date,
  property_type text,
  features text[],
  created_at timestamptz default now()
);

-- Users
create table users (
  id uuid primary key references auth.users,
  email text,
  name text,
  buyer_profile jsonb,       -- {budget, beds_min, baths_min, priorities[], dealbreakers[]}
  created_at timestamptz default now()
);

-- Saved properties
create table saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  property_id uuid references properties(id),
  notes text,
  created_at timestamptz default now()
);

-- Offers
create table offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  property_id uuid references properties(id),
  offer_price int,
  earnest_money int,
  option_fee int,
  option_days int,
  closing_date date,
  financing_contingency boolean,
  selected_comp_ids uuid[],   -- which comps the buyer approved
  status text,                -- 'draft', 'submitted', 'accepted', 'rejected'
  trec_form_data jsonb,       -- full form field values
  created_at timestamptz default now()
);
```

---

## Data Model — TypeScript Types

```typescript
// types/index.ts

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
  floodZone: string;
  hoaMonthly: number | null;
  photos: string[];
  description: string;
  features: string[];
  priceHistory: PriceEvent[];
  taxHistory: TaxRecord[];
  permitHistory: PermitRecord[];
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
  saleDate: string;
  propertyType: string;
  features: string[];
  // computed fields
  similarityScore?: number;
  distanceMiles?: number;
  pricePerSqft?: number;
  keyDifferences?: string[];
}

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

export interface BuyerProfile {
  budget: number;
  bedsMin: number;
  bathsMin: number;
  priorities: string[];
  dealbreakers: string[];
}
```

---

## Comp Scoring Algorithm

```typescript
// lib/comps/scoring.ts
// Similarity score 0-100 for a comp vs. subject property

export function scoreComp(subject: Property, comp: SoldComp): number {
  let score = 100;

  // Recency (most important — market conditions change)
  const monthsAgo = monthsSince(comp.saleDate);
  if (monthsAgo > 12) score -= 30;
  else if (monthsAgo > 6) score -= 15;
  else if (monthsAgo > 3) score -= 5;

  // Distance
  const miles = haversineDistance(subject, comp);
  if (miles > 1.0) score -= 25;
  else if (miles > 0.5) score -= 10;
  else if (miles > 0.25) score -= 3;

  // Size similarity (sqft)
  const sqftDiff = Math.abs(subject.sqft - comp.sqft) / subject.sqft;
  if (sqftDiff > 0.25) score -= 20;
  else if (sqftDiff > 0.15) score -= 10;
  else if (sqftDiff > 0.08) score -= 4;

  // Bed/bath match
  if (comp.beds !== subject.beds) score -= 8;
  if (comp.baths !== subject.baths) score -= 5;

  // Same zip
  if (comp.zip !== subject.zip) score -= 10;

  // Property type match
  if (comp.propertyType !== subject.propertyType) score -= 15;

  return Math.max(0, score);
}
```

---

## Phase 1 Build Order (what to tell Claude Code)

### Step 1 — Scaffold & Seed
```
- Init Next.js 14 with TypeScript and Tailwind
- Install shadcn/ui
- Set up Supabase project and run migration
- Build seed script with 15 Austin TX properties + 40 sold comps
```

### Step 2 — Property List & Detail
```
- Search/filter page with property cards
- Property detail page: photos, specs, price history
- Mapbox map with property pin and nearby comps
```

### Step 3 — Comp Selector
```
- Comp scoring algorithm
- Comp selector UI: recommended comps with swap/remove
- Live price range bar that recalculates on comp changes
```

### Step 4 — AI Advisory Brief
```
- Claude API integration
- Per-property advisory brief: red flags, positives, neighborhood context
- Bidding strategy section
```

### Step 5 — Offer Wizard
```
- Step-by-step TREC form walkthrough
- Plain-language tooltips on every field
- Offer summary + PDF generation
```

---

## First Prompt for Claude Code

Paste this to get started:

```
I am building a real estate platform called HomeIQ that helps 
first-time buyers in Texas purchase homes without a realtor.

Tech stack: Next.js 14 (app router), TypeScript, Tailwind, 
shadcn/ui, Supabase, Anthropic Claude API, Mapbox GL JS.

Task 1: Project scaffold
- Initialize the project with the above stack
- Create the folder structure as defined in the architecture doc
- Set up Supabase client in lib/db/
- Create the TypeScript types in types/index.ts
- Create the database migration SQL in supabase/migrations/001_initial_schema.sql
- Build a seed script in lib/data/seed.ts with 15 realistic 
  Austin TX single-family homes (realistic addresses, prices 
  $350k-$800k, realistic specs) and 40 sold comps in the same 
  areas with sale dates in the last 12 months

Do not build any UI yet. Just scaffold, types, DB, and seed data.
```
