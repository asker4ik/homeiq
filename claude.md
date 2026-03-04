# HomeIQ — Claude Code Instructions

## What We're Building
HomeIQ is a real estate platform that helps first-time buyers in Texas purchase homes without a realtor. The goal is to replace the core value a buyer's agent provides: finding the right home, understanding the market, making an offer, and closing — all guided by AI.

Starting market: Texas (no attorney required, TREC standard forms are public).
Business model: $499 flat fee paid only on close.
Target user: Solo first-time buyer.

Full architecture is in ARCHITECTURE.md. Read it before starting any task.

---

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript — always, no exceptions
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (Postgres)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Maps**: Mapbox GL JS
- **Auth**: Supabase Auth
- **Hosting**: Vercel

---

## Code Conventions

### General
- Always use TypeScript with proper types — no `any`
- All shared types live in `types/index.ts`
- All Supabase queries live in `lib/db/queries.ts`
- All Claude prompts live in `lib/ai/prompts.ts` — never inline prompts in components
- Use named exports everywhere except Next.js page components (those use default export)
- Prefer `async/await` over `.then()` chains

### File & Folder Naming
- Components: PascalCase (`PropertyCard.tsx`)
- Utilities, lib files: camelCase (`scoring.ts`)
- Folders: camelCase (`lib/comps/`)
- API routes: follow Next.js convention (`app/api/properties/route.ts`)

### Components
- Keep components focused — if a component exceeds ~150 lines, split it
- UI-only components go in `components/ui/` (shadcn lives here)
- Feature components go in their feature folder (`components/property/`, `components/comps/`, etc.)
- No data fetching inside UI components — pass data as props or use a parent server component

### API Routes
- All API routes return `{ data, error }` shape
- Always handle errors explicitly — no unhandled promise rejections
- Validate inputs before hitting the database

### Environment Variables
- Never hardcode API keys or URLs
- All secrets go in `.env.local`
- Required vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`
  - `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Data Layer Rules
- The data schema is the source of truth — defined in `supabase/migrations/001_initial_schema.sql`
- TypeScript types in `types/index.ts` must mirror the DB schema exactly (camelCase in TS, snake_case in DB)
- Seed data lives in `lib/data/seed.ts` — 15 Austin TX active listings + 40 sold comps
- Seed data should be realistic: varied neighborhoods, price range $350k–$800k, varied features (some with HOA, one in flood zone, varied school zones, some with price reductions)
- When real data providers are integrated later, only `lib/db/queries.ts` should need to change

---

## AI / Claude API Rules
- Model: always use `claude-sonnet-4-20250514`
- All prompts are in `lib/ai/prompts.ts` as exported functions that take typed inputs and return a prompt string
- API calls to Claude happen only in Next.js API routes — never client-side
- Always stream responses for anything user-facing (advisory briefs, bidding strategy)
- Never expose the Anthropic API key to the client

---

## What We Are NOT Building Yet
- Do not build authentication flows until Phase 3
- Do not integrate real MLS or third-party data APIs — use seed data only
- Do not build payment processing yet
- Do not build the mortgage or title partner integrations yet
- Do not build anything for sellers — buyers only

---

## Phase Build Order
Work through these in order. Do not jump ahead.

1. **Phase 1** — Scaffold, types, DB schema, seed data (no UI)
2. **Phase 2** — Property list page, property detail page, Mapbox map
3. **Phase 3** — Comp selector UI with live price range calculation
4. **Phase 4** — AI advisory brief (Claude API integration)
5. **Phase 5** — Offer wizard with TREC form walkthrough

---

## Key Product Decisions to Always Keep in Mind
- **Liability**: We give buyers a price range based on comps they approve. We do not tell them what to bid. The buyer makes the final call.
- **Texas-specific**: TREC forms are public and standard. Lean into this. All offer logic should reference TREC conventions.
- **Plain language always**: Every form field, every data point, every AI output should be written for someone buying their first home. No jargon without explanation.
- **Comp transparency**: Buyers can see, remove, and replace every comp used in the price analysis. They own the inputs.
