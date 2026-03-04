-- HomeIQ Initial Schema
-- Run this against your Supabase project via the SQL editor or CLI

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Properties ───────────────────────────────────────────────────────────────
create table if not exists properties (
  id              uuid primary key default gen_random_uuid(),
  address         text not null,
  city            text not null,
  state           text not null default 'TX',
  zip             text not null,
  lat             decimal(10, 7),
  lng             decimal(10, 7),
  beds            int,
  baths           decimal(3, 1),
  sqft            int,
  lot_sqft        int,
  year_built      int,
  list_price      int,
  days_on_market  int default 0,
  property_type   text check (property_type in ('single_family', 'condo', 'townhouse')),
  status          text check (status in ('active', 'pending', 'sold')) default 'active',
  school_zone     text,
  flood_zone      text default 'X',   -- FEMA flood zone designation; X = minimal risk
  hoa_monthly     int,                -- null means no HOA
  photos          text[],
  description     text,
  features        text[],
  price_history   jsonb default '[]',
  tax_history     jsonb default '[]',
  permit_history  jsonb default '[]',
  created_at      timestamptz default now()
);

-- ─── Sold Comps ───────────────────────────────────────────────────────────────
create table if not exists sold_comps (
  id            uuid primary key default gen_random_uuid(),
  address       text not null,
  city          text not null,
  zip           text not null,
  lat           decimal(10, 7),
  lng           decimal(10, 7),
  beds          int,
  baths         decimal(3, 1),
  sqft          int,
  lot_sqft      int,
  year_built    int,
  sale_price    int not null,
  sale_date     date not null,
  property_type text check (property_type in ('single_family', 'condo', 'townhouse')),
  features      text[],
  created_at    timestamptz default now()
);

-- ─── Users ────────────────────────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key references auth.users on delete cascade,
  email         text,
  name          text,
  buyer_profile jsonb,   -- {budget, beds_min, baths_min, priorities[], dealbreakers[]}
  created_at    timestamptz default now()
);

-- ─── Saved Properties ─────────────────────────────────────────────────────────
create table if not exists saved_properties (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  notes       text,
  created_at  timestamptz default now(),
  unique (user_id, property_id)
);

-- ─── Offers ───────────────────────────────────────────────────────────────────
create table if not exists offers (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references users(id) on delete cascade,
  property_id           uuid not null references properties(id),
  offer_price           int not null,
  earnest_money         int,
  option_fee            int,
  option_days           int,
  closing_date          date,
  financing_contingency boolean default true,
  selected_comp_ids     uuid[],   -- comp IDs the buyer approved
  status                text check (status in ('draft', 'submitted', 'accepted', 'rejected')) default 'draft',
  trec_form_data        jsonb,
  created_at            timestamptz default now()
);

-- ─── Row-Level Security ───────────────────────────────────────────────────────
-- Properties and sold_comps are publicly readable (no auth required for browsing)
alter table properties enable row level security;
alter table sold_comps enable row level security;
alter table users enable row level security;
alter table saved_properties enable row level security;
alter table offers enable row level security;

create policy "properties_public_read"
  on properties for select using (true);

create policy "sold_comps_public_read"
  on sold_comps for select using (true);

create policy "users_own_row"
  on users for all using (auth.uid() = id);

create policy "saved_properties_own_rows"
  on saved_properties for all using (auth.uid() = user_id);

create policy "offers_own_rows"
  on offers for all using (auth.uid() = user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists properties_status_idx on properties (status);
create index if not exists properties_zip_idx on properties (zip);
create index if not exists sold_comps_zip_idx on sold_comps (zip);
create index if not exists sold_comps_sale_date_idx on sold_comps (sale_date desc);
create index if not exists saved_properties_user_idx on saved_properties (user_id);
create index if not exists offers_user_idx on offers (user_id);
create index if not exists offers_property_idx on offers (property_id);
