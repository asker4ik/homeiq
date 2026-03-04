/**
 * Seed script — 15 Austin TX active listings + 40 sold comps
 * Run with: npm run seed
 *
 * Neighborhoods covered:
 *   78704 — South Congress / South Lamar (SoCo)
 *   78745 — South Austin (Slaughter / William Cannon)
 *   78702 — East Austin (Holly / Govalle)
 *   78751 — Hyde Park / North Loop
 *   78723 — Mueller / Windsor Park
 *   78757 — Brentwood / Crestview
 *   78750 — Cedar Park / NW Austin
 *   78759 — Great Hills / Arboretum
 */

import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function insert(table: string, rows: Record<string, unknown>[]): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=minimal,resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(await res.text());
}

// ─── Active Listings ──────────────────────────────────────────────────────────

const activeListings = [
  // 1. South Congress — SoCo starter, no HOA, price reduced
  {
    address: "2214 Maplewood Dr",
    city: "Austin",
    state: "TX",
    zip: "78704",
    lat: 30.2381,
    lng: -97.7707,
    beds: 3,
    baths: 2,
    sqft: 1480,
    lotSqft: 6098,
    yearBuilt: 1962,
    listPrice: 499000,
    daysOnMarket: 31,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Austin ISD — Dawson Elementary",
    floodZone: "X",
    hoaMonthly: null,
    photos: [],
    description:
      "Charming mid-century bungalow a short walk from South Congress Ave. Original hardwood floors, updated kitchen with quartz counters, and a large backyard with mature oak trees. Price recently reduced — sellers are motivated.",
    features: ["hardwood_floors", "updated_kitchen", "large_backyard", "oak_trees", "no_hoa"],
    priceHistory: [
      { date: "2025-12-10", price: 535000, event: "listed" },
      { date: "2026-01-15", price: 499000, event: "reduced" },
    ],
    taxHistory: [
      { year: 2024, assessed: 480000, tax: 9840 },
      { year: 2023, assessed: 455000, tax: 9328 },
    ],
    permitHistory: [
      { date: "2021-04-12", type: "remodel", description: "Kitchen renovation — new cabinets, counters, appliances" },
    ],
  },

  // 2. South Austin (78745) — larger lot, garage
  {
    address: "5803 Manchaca Rd",
    city: "Austin",
    state: "TX",
    zip: "78745",
    lat: 30.2018,
    lng: -97.7889,
    beds: 4,
    baths: 2.5,
    sqft: 2210,
    lotSqft: 8712,
    yearBuilt: 1988,
    listPrice: 589000,
    daysOnMarket: 14,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Austin ISD — Sunset Valley Elementary",
    floodZone: "X",
    hoaMonthly: null,
    photos: [],
    description:
      "Spacious 4-bed/2.5-bath in popular South Austin. Updated primary bath, open-concept living/dining, and a two-car garage. Large backyard with covered patio — perfect for entertaining. Easy access to Mopac and 290.",
    features: ["garage_2", "covered_patio", "updated_bath", "open_concept", "no_hoa"],
    priceHistory: [{ date: "2026-02-18", price: 589000, event: "listed" }],
    taxHistory: [
      { year: 2024, assessed: 570000, tax: 11685 },
      { year: 2023, assessed: 542000, tax: 11111 },
    ],
    permitHistory: [
      { date: "2019-08-22", type: "addition", description: "Covered back patio — 280 sqft" },
    ],
  },

  // 3. East Austin (78702) — walkable, higher price/sqft, no HOA
  {
    address: "1507 Willow St",
    city: "Austin",
    state: "TX",
    zip: "78702",
    lat: 30.2594,
    lng: -97.7231,
    beds: 3,
    baths: 2,
    sqft: 1320,
    lotSqft: 5227,
    yearBuilt: 1945,
    listPrice: 699000,
    daysOnMarket: 8,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Austin ISD — Metz Elementary",
    floodZone: "X",
    hoaMonthly: null,
    photos: [],
    description:
      "Fully renovated craftsman cottage in the heart of East Austin. New roof (2023), new HVAC (2023), designer finishes throughout. Walk to bars, restaurants, and the hike-and-bike trail. One of the hottest zip codes in Austin.",
    features: ["renovated", "new_roof", "new_hvac", "walkable", "craftsman", "no_hoa"],
    priceHistory: [{ date: "2026-02-24", price: 699000, event: "listed" }],
    taxHistory: [
      { year: 2024, assessed: 650000, tax: 13325 },
      { year: 2023, assessed: 595000, tax: 12198 },
    ],
    permitHistory: [
      { date: "2023-01-10", type: "remodel", description: "Full interior renovation — kitchen, baths, flooring" },
      { date: "2023-03-05", type: "remodel", description: "Roof replacement — architectural shingle" },
    ],
  },

  // 4. Hyde Park (78751) — classic neighborhood, HOA (neighborhood assoc)
  {
    address: "4402 Avenue H",
    city: "Austin",
    state: "TX",
    zip: "78751",
    lat: 30.3121,
    lng: -97.7289,
    beds: 3,
    baths: 1.5,
    sqft: 1650,
    lotSqft: 7840,
    yearBuilt: 1935,
    listPrice: 625000,
    daysOnMarket: 22,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Austin ISD — Lee Elementary",
    floodZone: "X",
    hoaMonthly: 40,
    photos: [],
    description:
      "Beautiful Tudor-style home in historic Hyde Park, one of Austin's most beloved neighborhoods. Original wood floors, clawfoot tub, updated kitchen. Large pecan trees shade the front yard. Blocks from The Drag and UT campus.",
    features: ["hardwood_floors", "original_character", "tudor_style", "mature_trees", "updated_kitchen"],
    priceHistory: [
      { date: "2026-01-28", price: 649000, event: "listed" },
      { date: "2026-02-20", price: 625000, event: "reduced" },
    ],
    taxHistory: [
      { year: 2024, assessed: 598000, tax: 12259 },
      { year: 2023, assessed: 565000, tax: 11583 },
    ],
    permitHistory: [
      { date: "2018-06-14", type: "remodel", description: "Kitchen update — new appliances, counters" },
    ],
  },

  // 5. Mueller (78723) — new-ish, HOA community
  {
    address: "1823 Simond Ave",
    city: "Austin",
    state: "TX",
    zip: "78723",
    lat: 30.2971,
    lng: -97.6998,
    beds: 3,
    baths: 2.5,
    sqft: 1940,
    lotSqft: 4356,
    yearBuilt: 2016,
    listPrice: 675000,
    daysOnMarket: 5,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Austin ISD — Blanton Elementary",
    floodZone: "X",
    hoaMonthly: 125,
    photos: [],
    description:
      "Modern single-family home in the master-planned Mueller community. Open floor plan, chef's kitchen, rooftop deck with downtown views. HOA includes access to pool, parks, and community events. Steps to Alamo Drafthouse and the farmer's market.",
    features: ["rooftop_deck", "chefs_kitchen", "open_floor_plan", "community_pool", "park_access", "downtown_views"],
    priceHistory: [{ date: "2026-03-01", price: 675000, event: "listed" }],
    taxHistory: [
      { year: 2024, assessed: 648000, tax: 13284 },
      { year: 2023, assessed: 620000, tax: 12710 },
    ],
    permitHistory: [],
  },

  // 6. Brentwood (78757) — mid-size, no HOA, pool
  {
    address: "7106 Grover Ave",
    city: "Austin",
    state: "TX",
    zip: "78757",
    lat: 30.3388,
    lng: -97.7371,
    beds: 3,
    baths: 2,
    sqft: 1780,
    lotSqft: 8276,
    yearBuilt: 1957,
    listPrice: 649000,
    daysOnMarket: 18,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Austin ISD — Brentwood Elementary",
    floodZone: "X",
    hoaMonthly: null,
    photos: [],
    description:
      "Classic Brentwood ranch on a corner lot with a pool. Updated kitchen and primary bath, original terrazzo floors in living areas. No HOA. Short drive to Domain and Q2 Stadium. Crestview neighborhood feel.",
    features: ["pool", "terrazzo_floors", "corner_lot", "updated_kitchen", "updated_bath", "no_hoa"],
    priceHistory: [{ date: "2026-02-14", price: 649000, event: "listed" }],
    taxHistory: [
      { year: 2024, assessed: 625000, tax: 12813 },
      { year: 2023, assessed: 601000, tax: 12321 },
    ],
    permitHistory: [
      { date: "2015-07-28", type: "pool", description: "Inground pool and decking installation" },
      { date: "2022-09-11", type: "remodel", description: "Primary bath renovation" },
    ],
  },

  // 7. South Lamar (78704) — townhouse with HOA
  {
    address: "3201 S Lamar Blvd #12",
    city: "Austin",
    state: "TX",
    zip: "78704",
    lat: 30.2512,
    lng: -97.7740,
    beds: 2,
    baths: 2.5,
    sqft: 1280,
    lotSqft: 1742,
    yearBuilt: 2008,
    listPrice: 479000,
    daysOnMarket: 42,
    propertyType: "townhouse",
    status: "active",
    schoolZone: "Austin ISD — Joslin Elementary",
    floodZone: "X",
    hoaMonthly: 210,
    photos: [],
    description:
      "Lock-and-leave townhouse on South Lamar. Private attached garage, rooftop terrace, and high-end finishes. HOA covers exterior maintenance and landscaping. Walk to Alamo Drafthouse, Uchi, and Barton Creek Greenbelt trailheads.",
    features: ["rooftop_terrace", "garage_1", "lock_and_leave", "greenbelt_access", "walkable"],
    priceHistory: [
      { date: "2025-12-20", price: 519000, event: "listed" },
      { date: "2026-01-28", price: 499000, event: "reduced" },
      { date: "2026-02-18", price: 479000, event: "reduced" },
    ],
    taxHistory: [
      { year: 2024, assessed: 468000, tax: 9594 },
      { year: 2023, assessed: 452000, tax: 9267 },
    ],
    permitHistory: [],
  },

  // 8. Windsor Park (78723) — flood zone AE — one in flood zone per spec
  {
    address: "6012 Berkman Dr",
    city: "Austin",
    state: "TX",
    zip: "78723",
    lat: 30.3012,
    lng: -97.6882,
    beds: 3,
    baths: 1,
    sqft: 1350,
    lotSqft: 9583,
    yearBuilt: 1955,
    listPrice: 389000,
    daysOnMarket: 55,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Austin ISD — Andrews Elementary",
    floodZone: "AE",  // High-risk flood zone
    hoaMonthly: null,
    photos: [],
    description:
      "Great bones and a huge lot in Windsor Park. Original hardwood floors, large kitchen footprint ready for your renovation. Note: property is in FEMA flood zone AE — flood insurance required. Priced accordingly. Excellent value for the area.",
    features: ["hardwood_floors", "large_lot", "renovation_opportunity", "no_hoa"],
    priceHistory: [
      { date: "2025-12-01", price: 430000, event: "listed" },
      { date: "2026-01-05", price: 410000, event: "reduced" },
      { date: "2026-02-01", price: 389000, event: "reduced" },
    ],
    taxHistory: [
      { year: 2024, assessed: 370000, tax: 7585 },
      { year: 2023, assessed: 355000, tax: 7278 },
    ],
    permitHistory: [],
  },

  // 9. Cedar Park (78750) — suburb, newer build, HOA
  {
    address: "2408 Lakewood Dr",
    city: "Cedar Park",
    state: "TX",
    zip: "78613",
    lat: 30.5052,
    lng: -97.8203,
    beds: 4,
    baths: 3,
    sqft: 2680,
    lotSqft: 8276,
    yearBuilt: 2004,
    listPrice: 575000,
    daysOnMarket: 10,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Leander ISD — Deer Creek Elementary",
    floodZone: "X",
    hoaMonthly: 65,
    photos: [],
    description:
      "Well-maintained 4-bed/3-bath in Cedar Park's Lakewood subdivision. Open kitchen with granite counters, formal dining, game room upstairs. Minutes to HEB, Target, and 183A toll road. Top-rated Leander ISD schools.",
    features: ["granite_counters", "game_room", "formal_dining", "garage_2", "leander_isd"],
    priceHistory: [{ date: "2026-02-22", price: 575000, event: "listed" }],
    taxHistory: [
      { year: 2024, assessed: 558000, tax: 9928 },
      { year: 2023, assessed: 530000, tax: 9434 },
    ],
    permitHistory: [
      { date: "2020-05-17", type: "fence", description: "Privacy fence — backyard" },
    ],
  },

  // 10. Great Hills / Arboretum (78759) — upscale, higher price
  {
    address: "9203 Covington Dr",
    city: "Austin",
    state: "TX",
    zip: "78759",
    lat: 30.3889,
    lng: -97.7572,
    beds: 4,
    baths: 3,
    sqft: 2920,
    lotSqft: 10890,
    yearBuilt: 1992,
    listPrice: 799000,
    daysOnMarket: 7,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Round Rock ISD — Forest North Elementary",
    floodZone: "X",
    hoaMonthly: 85,
    photos: [],
    description:
      "Gorgeous home in Great Hills, minutes from the Domain and Arboretum. Vaulted ceilings, updated kitchen with SS appliances, primary suite with spa bath. Entertainer's backyard with covered patio and mature oaks. Round Rock ISD schools.",
    features: ["vaulted_ceilings", "updated_kitchen", "spa_bath", "covered_patio", "oak_trees", "round_rock_isd"],
    priceHistory: [{ date: "2026-02-25", price: 799000, event: "listed" }],
    taxHistory: [
      { year: 2024, assessed: 765000, tax: 13617 },
      { year: 2023, assessed: 730000, tax: 13003 },
    ],
    permitHistory: [
      { date: "2020-10-14", type: "remodel", description: "Kitchen renovation — full gut, new cabinets, quartz, appliances" },
      { date: "2022-06-30", type: "remodel", description: "Primary bath remodel — walk-in shower, dual vanity" },
    ],
  },

  // 11. South Austin (78745) — entry-level, smaller
  {
    address: "3304 Glenview Ave",
    city: "Austin",
    state: "TX",
    zip: "78745",
    lat: 30.2156,
    lng: -97.7801,
    beds: 2,
    baths: 1,
    sqft: 1020,
    lotSqft: 6534,
    yearBuilt: 1950,
    listPrice: 369000,
    daysOnMarket: 38,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Austin ISD — Sunset Valley Elementary",
    floodZone: "X",
    hoaMonthly: null,
    photos: [],
    description:
      "South Austin starter home with big lot potential. Cute 2/1 with screened-in porch and room to expand or build ADU. No HOA. Walking distance to local coffee shops and South Congress vintage stores. A true fixer-upper priced to move.",
    features: ["screened_porch", "adu_potential", "large_lot", "no_hoa", "fixer_upper"],
    priceHistory: [
      { date: "2026-01-20", price: 395000, event: "listed" },
      { date: "2026-02-15", price: 369000, event: "reduced" },
    ],
    taxHistory: [
      { year: 2024, assessed: 352000, tax: 7214 },
      { year: 2023, assessed: 335000, tax: 6868 },
    ],
    permitHistory: [],
  },

  // 12. East Austin (78702) — new construction condo
  {
    address: "1102 Chicon St #3",
    city: "Austin",
    state: "TX",
    zip: "78702",
    lat: 30.2672,
    lng: -97.7172,
    beds: 2,
    baths: 2,
    sqft: 1100,
    lotSqft: 0,
    yearBuilt: 2022,
    listPrice: 519000,
    daysOnMarket: 20,
    propertyType: "condo",
    status: "active",
    schoolZone: "Austin ISD — Campbell Elementary",
    floodZone: "X",
    hoaMonthly: 180,
    photos: [],
    description:
      "Brand-new East Austin condo with high-end finishes. Polished concrete floors, Bosch appliances, custom cabinetry, private balcony. HOA includes exterior maintenance and trash. Walk score 91 — blocks from the best bars and restaurants in Austin.",
    features: ["new_construction", "polished_concrete", "bosch_appliances", "private_balcony", "high_walk_score"],
    priceHistory: [{ date: "2026-02-12", price: 519000, event: "listed" }],
    taxHistory: [
      { year: 2024, assessed: 490000, tax: 10045 },
    ],
    permitHistory: [
      { date: "2021-08-01", type: "addition", description: "New construction — 4-unit condo building" },
    ],
  },

  // 13. Brentwood (78757) — pending, slightly over budget for context
  {
    address: "7714 Bethune Ave",
    city: "Austin",
    state: "TX",
    zip: "78757",
    lat: 30.3447,
    lng: -97.7264,
    beds: 3,
    baths: 2,
    sqft: 1650,
    lotSqft: 7405,
    yearBuilt: 1959,
    listPrice: 669000,
    daysOnMarket: 4,
    propertyType: "single_family",
    status: "pending",
    schoolZone: "Austin ISD — Brentwood Elementary",
    floodZone: "X",
    hoaMonthly: null,
    photos: [],
    description:
      "Renovated Brentwood ranch under contract within 4 days of listing. Beautiful open-plan renovation, quartz kitchen, spa primary bath, and a huge detached workshop/studio. Deal pending — listed for comp reference.",
    features: ["renovated", "workshop_studio", "quartz_kitchen", "spa_bath", "open_plan", "no_hoa"],
    priceHistory: [{ date: "2026-03-01", price: 669000, event: "listed" }],
    taxHistory: [
      { year: 2024, assessed: 638000, tax: 13079 },
      { year: 2023, assessed: 605000, tax: 12403 },
    ],
    permitHistory: [
      { date: "2023-11-20", type: "remodel", description: "Full interior gut renovation" },
      { date: "2024-02-15", type: "addition", description: "Detached studio/workshop — 400 sqft" },
    ],
  },

  // 14. Mueller (78723) — active, townhouse with HOA
  {
    address: "4508 Berkman Dr",
    city: "Austin",
    state: "TX",
    zip: "78723",
    lat: 30.2944,
    lng: -97.7011,
    beds: 3,
    baths: 3.5,
    sqft: 2050,
    lotSqft: 2178,
    yearBuilt: 2019,
    listPrice: 729000,
    daysOnMarket: 12,
    propertyType: "townhouse",
    status: "active",
    schoolZone: "Austin ISD — Blanton Elementary",
    floodZone: "X",
    hoaMonthly: 195,
    photos: [],
    description:
      "Modern 3-story townhouse in Mueller with a private rooftop deck and 2-car tandem garage. Luxury finishes: waterfall island, wide-plank oak floors, Thermador range. HOA covers exterior, irrigation, and community pool/park access.",
    features: ["rooftop_deck", "garage_2_tandem", "waterfall_island", "oak_floors", "thermador_range", "community_pool"],
    priceHistory: [{ date: "2026-02-20", price: 729000, event: "listed" }],
    taxHistory: [
      { year: 2024, assessed: 698000, tax: 14310 },
      { year: 2023, assessed: 670000, tax: 13735 },
    ],
    permitHistory: [],
  },

  // 15. Round Rock (78665) — suburban value, large home
  {
    address: "1812 Creek Bend Dr",
    city: "Round Rock",
    state: "TX",
    zip: "78665",
    lat: 30.5128,
    lng: -97.6234,
    beds: 5,
    baths: 3,
    sqft: 3100,
    lotSqft: 9148,
    yearBuilt: 2001,
    listPrice: 549000,
    daysOnMarket: 25,
    propertyType: "single_family",
    status: "active",
    schoolZone: "Round Rock ISD — Gattis Elementary",
    floodZone: "X",
    hoaMonthly: 50,
    photos: [],
    description:
      "Spacious 5-bed/3-bath in established Round Rock neighborhood. Large game room, formal dining, master suite with sitting area. New roof 2024, HVAC 2022. Great Round Rock ISD schools. Commuter-friendly — 30 min to downtown Austin via I-35.",
    features: ["game_room", "formal_dining", "new_roof", "new_hvac", "round_rock_isd", "garage_2"],
    priceHistory: [
      { date: "2026-02-07", price: 569000, event: "listed" },
      { date: "2026-02-28", price: 549000, event: "reduced" },
    ],
    taxHistory: [
      { year: 2024, assessed: 530000, tax: 9434 },
      { year: 2023, assessed: 508000, tax: 9042 },
    ],
    permitHistory: [
      { date: "2022-08-10", type: "remodel", description: "HVAC system replacement" },
      { date: "2024-03-05", type: "remodel", description: "Roof replacement — architectural shingle" },
    ],
  },
];

// ─── Sold Comps ───────────────────────────────────────────────────────────────

const soldComps = [
  // ── 78704 (SoCo / South Lamar) ──────────────────────────────────────────────
  { address: "2108 Newfield Ln", city: "Austin", zip: "78704", lat: 30.2371, lng: -97.7692, beds: 3, baths: 2, sqft: 1410, lotSqft: 5663, yearBuilt: 1960, salePrice: 487000, saleDate: "2025-12-05", propertyType: "single_family", features: ["hardwood_floors", "updated_kitchen"] },
  { address: "2401 Toomey Rd", city: "Austin", zip: "78704", lat: 30.2488, lng: -97.7741, beds: 3, baths: 2, sqft: 1550, lotSqft: 6534, yearBuilt: 1958, salePrice: 528000, saleDate: "2026-01-14", propertyType: "single_family", features: ["updated_bath", "large_backyard"] },
  { address: "1908 Kinney Ave", city: "Austin", zip: "78704", lat: 30.2399, lng: -97.7668, beds: 2, baths: 1, sqft: 960, lotSqft: 5227, yearBuilt: 1940, salePrice: 445000, saleDate: "2025-10-22", propertyType: "single_family", features: ["original_character", "no_hoa"] },
  { address: "2619 Hartford Rd", city: "Austin", zip: "78704", lat: 30.2344, lng: -97.7622, beds: 3, baths: 2, sqft: 1680, lotSqft: 7405, yearBuilt: 1965, salePrice: 515000, saleDate: "2025-11-08", propertyType: "single_family", features: ["pool", "no_hoa"] },
  { address: "3005 S 5th St", city: "Austin", zip: "78704", lat: 30.2449, lng: -97.7710, beds: 4, baths: 2.5, sqft: 2020, lotSqft: 8712, yearBuilt: 1972, salePrice: 618000, saleDate: "2026-02-01", propertyType: "single_family", features: ["garage_2", "updated_kitchen"] },

  // ── 78745 (South Austin) ────────────────────────────────────────────────────
  { address: "5604 Westcreek Dr", city: "Austin", zip: "78745", lat: 30.1998, lng: -97.7844, beds: 3, baths: 2, sqft: 1560, lotSqft: 7841, yearBuilt: 1986, salePrice: 474000, saleDate: "2025-12-18", propertyType: "single_family", features: ["no_hoa", "large_lot"] },
  { address: "6102 Odessa Ave", city: "Austin", zip: "78745", lat: 30.2041, lng: -97.7912, beds: 4, baths: 2.5, sqft: 2280, lotSqft: 9148, yearBuilt: 1994, salePrice: 568000, saleDate: "2026-01-25", propertyType: "single_family", features: ["garage_2", "covered_patio"] },
  { address: "4907 Palo Duro Dr", city: "Austin", zip: "78745", lat: 30.2082, lng: -97.7876, beds: 3, baths: 2, sqft: 1390, lotSqft: 6098, yearBuilt: 1978, salePrice: 435000, saleDate: "2025-10-10", propertyType: "single_family", features: ["no_hoa"] },
  { address: "5201 Tannehill Ln", city: "Austin", zip: "78745", lat: 30.2033, lng: -97.7799, beds: 4, baths: 3, sqft: 2150, lotSqft: 8276, yearBuilt: 1999, salePrice: 549000, saleDate: "2025-11-30", propertyType: "single_family", features: ["garage_2", "updated_kitchen", "formal_dining"] },
  { address: "3812 Manchaca Rd", city: "Austin", zip: "78704", lat: 30.2319, lng: -97.7878, beds: 2, baths: 1, sqft: 1050, lotSqft: 5663, yearBuilt: 1948, salePrice: 399000, saleDate: "2026-02-14", propertyType: "single_family", features: ["original_character", "fixer_upper"] },

  // ── 78702 (East Austin) ─────────────────────────────────────────────────────
  { address: "1602 Holly St", city: "Austin", zip: "78702", lat: 30.2578, lng: -97.7199, beds: 3, baths: 2, sqft: 1290, lotSqft: 5663, yearBuilt: 1943, salePrice: 689000, saleDate: "2025-12-12", propertyType: "single_family", features: ["renovated", "walkable"] },
  { address: "1415 Comal St", city: "Austin", zip: "78702", lat: 30.2639, lng: -97.7215, beds: 2, baths: 2, sqft: 1080, lotSqft: 0, yearBuilt: 2018, salePrice: 575000, saleDate: "2026-01-10", propertyType: "condo", features: ["new_construction", "private_balcony"] },
  { address: "2204 E 6th St", city: "Austin", zip: "78702", lat: 30.2621, lng: -97.7143, beds: 3, baths: 2, sqft: 1380, lotSqft: 5227, yearBuilt: 1952, salePrice: 720000, saleDate: "2025-11-20", propertyType: "single_family", features: ["renovated", "walkable", "no_hoa"] },
  { address: "1318 Medina St", city: "Austin", zip: "78702", lat: 30.2597, lng: -97.7268, beds: 3, baths: 1.5, sqft: 1200, lotSqft: 4792, yearBuilt: 1938, salePrice: 648000, saleDate: "2025-09-30", propertyType: "single_family", features: ["original_character", "walkable"] },
  { address: "908 Chicon St", city: "Austin", zip: "78702", lat: 30.2644, lng: -97.7176, beds: 2, baths: 2, sqft: 1120, lotSqft: 0, yearBuilt: 2021, salePrice: 539000, saleDate: "2026-02-08", propertyType: "condo", features: ["new_construction", "high_walk_score"] },

  // ── 78751 (Hyde Park) ───────────────────────────────────────────────────────
  { address: "4201 Speedway", city: "Austin", zip: "78751", lat: 30.3098, lng: -97.7262, beds: 3, baths: 2, sqft: 1710, lotSqft: 8276, yearBuilt: 1930, salePrice: 638000, saleDate: "2025-12-03", propertyType: "single_family", features: ["hardwood_floors", "updated_kitchen"] },
  { address: "4512 Duval St", city: "Austin", zip: "78751", lat: 30.3155, lng: -97.7310, beds: 2, baths: 1, sqft: 1100, lotSqft: 6098, yearBuilt: 1928, salePrice: 575000, saleDate: "2026-01-22", propertyType: "single_family", features: ["original_character", "mature_trees"] },
  { address: "4308 Ramsey Ave", city: "Austin", zip: "78751", lat: 30.3138, lng: -97.7298, beds: 3, baths: 1.5, sqft: 1620, lotSqft: 7405, yearBuilt: 1933, salePrice: 612000, saleDate: "2025-10-15", propertyType: "single_family", features: ["hardwood_floors", "mature_trees"] },

  // ── 78723 (Mueller / Windsor Park) ─────────────────────────────────────────
  { address: "1910 Simond Ave", city: "Austin", zip: "78723", lat: 30.2982, lng: -97.7002, beds: 3, baths: 2.5, sqft: 1890, lotSqft: 4356, yearBuilt: 2015, salePrice: 648000, saleDate: "2025-11-14", propertyType: "single_family", features: ["community_pool", "park_access"] },
  { address: "2008 Aldrich St", city: "Austin", zip: "78723", lat: 30.2958, lng: -97.7021, beds: 4, baths: 3, sqft: 2180, lotSqft: 5227, yearBuilt: 2017, salePrice: 719000, saleDate: "2026-01-08", propertyType: "single_family", features: ["rooftop_deck", "chefs_kitchen"] },
  { address: "6212 Berkman Dr", city: "Austin", zip: "78723", lat: 30.3021, lng: -97.6872, beds: 3, baths: 1, sqft: 1280, lotSqft: 8712, yearBuilt: 1953, salePrice: 368000, saleDate: "2025-12-29", propertyType: "single_family", features: ["large_lot", "fixer_upper"] },
  { address: "4801 Berkman Dr", city: "Austin", zip: "78723", lat: 30.2931, lng: -97.7019, beds: 3, baths: 2.5, sqft: 1980, lotSqft: 2178, yearBuilt: 2018, salePrice: 685000, saleDate: "2026-02-18", propertyType: "townhouse", features: ["rooftop_deck", "garage_2_tandem"] },
  { address: "5904 Eastside Dr", city: "Austin", zip: "78723", lat: 30.2991, lng: -97.6914, beds: 4, baths: 2, sqft: 1760, lotSqft: 9583, yearBuilt: 1960, salePrice: 412000, saleDate: "2025-09-22", propertyType: "single_family", features: ["large_lot", "no_hoa"] },

  // ── 78757 (Brentwood / Crestview) ──────────────────────────────────────────
  { address: "7001 Shoal Creek Blvd", city: "Austin", zip: "78757", lat: 30.3372, lng: -97.7341, beds: 3, baths: 2, sqft: 1820, lotSqft: 9148, yearBuilt: 1960, salePrice: 672000, saleDate: "2025-11-05", propertyType: "single_family", features: ["updated_kitchen", "large_lot", "no_hoa"] },
  { address: "7308 Ironwood Rd", city: "Austin", zip: "78757", lat: 30.3398, lng: -97.7319, beds: 3, baths: 2, sqft: 1690, lotSqft: 7840, yearBuilt: 1958, salePrice: 637000, saleDate: "2026-01-18", propertyType: "single_family", features: ["updated_bath", "no_hoa"] },
  { address: "6915 Kiva Dr", city: "Austin", zip: "78757", lat: 30.3351, lng: -97.7388, beds: 4, baths: 2, sqft: 2010, lotSqft: 8712, yearBuilt: 1962, salePrice: 698000, saleDate: "2025-12-20", propertyType: "single_family", features: ["pool", "no_hoa", "updated_kitchen"] },
  { address: "7801 Whitman Ave", city: "Austin", zip: "78757", lat: 30.3468, lng: -97.7277, beds: 2, baths: 1, sqft: 1050, lotSqft: 6534, yearBuilt: 1952, salePrice: 548000, saleDate: "2025-10-30", propertyType: "single_family", features: ["original_character", "no_hoa"] },

  // ── 78613 (Cedar Park) ──────────────────────────────────────────────────────
  { address: "2201 Silverado Trail", city: "Cedar Park", zip: "78613", lat: 30.5039, lng: -97.8188, beds: 4, baths: 3, sqft: 2720, lotSqft: 8712, yearBuilt: 2003, salePrice: 555000, saleDate: "2025-12-10", propertyType: "single_family", features: ["granite_counters", "garage_2"] },
  { address: "1604 Cypress Creek Rd", city: "Cedar Park", zip: "78613", lat: 30.5071, lng: -97.8229, beds: 4, baths: 2.5, sqft: 2490, lotSqft: 7840, yearBuilt: 2001, salePrice: 529000, saleDate: "2026-01-31", propertyType: "single_family", features: ["garage_2", "game_room"] },
  { address: "803 Parkside Dr", city: "Cedar Park", zip: "78613", lat: 30.5019, lng: -97.8155, beds: 3, baths: 2, sqft: 1880, lotSqft: 6534, yearBuilt: 1998, salePrice: 468000, saleDate: "2025-11-22", propertyType: "single_family", features: ["garage_2", "no_hoa"] },

  // ── 78759 (Great Hills / Arboretum) ────────────────────────────────────────
  { address: "9001 Carpenters Way", city: "Austin", zip: "78759", lat: 30.3871, lng: -97.7538, beds: 4, baths: 3, sqft: 2880, lotSqft: 10019, yearBuilt: 1990, salePrice: 769000, saleDate: "2025-12-02", propertyType: "single_family", features: ["vaulted_ceilings", "oak_trees"] },
  { address: "9407 Northgate Blvd", city: "Austin", zip: "78759", lat: 30.3902, lng: -97.7601, beds: 3, baths: 2.5, sqft: 2310, lotSqft: 8712, yearBuilt: 1995, salePrice: 712000, saleDate: "2026-01-16", propertyType: "single_family", features: ["updated_kitchen", "covered_patio"] },
  { address: "8805 Hunters Trail", city: "Austin", zip: "78759", lat: 30.3848, lng: -97.7509, beds: 4, baths: 2, sqft: 2550, lotSqft: 11326, yearBuilt: 1989, salePrice: 742000, saleDate: "2025-10-28", propertyType: "single_family", features: ["large_lot", "oak_trees", "pool"] },

  // ── 78665 (Round Rock) ──────────────────────────────────────────────────────
  { address: "2104 Settlers Park Loop", city: "Round Rock", zip: "78665", lat: 30.5143, lng: -97.6218, beds: 5, baths: 3, sqft: 3050, lotSqft: 9148, yearBuilt: 2000, salePrice: 530000, saleDate: "2025-11-10", propertyType: "single_family", features: ["garage_2", "game_room", "round_rock_isd"] },
  { address: "1702 Ridge Top Rd", city: "Round Rock", zip: "78665", lat: 30.5098, lng: -97.6201, beds: 4, baths: 2.5, sqft: 2640, lotSqft: 8276, yearBuilt: 2003, salePrice: 499000, saleDate: "2026-02-05", propertyType: "single_family", features: ["garage_2", "formal_dining"] },
  { address: "908 Encanto Dr", city: "Round Rock", zip: "78665", lat: 30.5166, lng: -97.6249, beds: 3, baths: 2, sqft: 1920, lotSqft: 7405, yearBuilt: 1999, salePrice: 448000, saleDate: "2025-10-05", propertyType: "single_family", features: ["no_hoa"] },

  // ── Mix across zips (wider context) ────────────────────────────────────────
  { address: "3401 Bee Cave Rd", city: "Austin", zip: "78746", lat: 30.2803, lng: -97.8011, beds: 3, baths: 2.5, sqft: 2050, lotSqft: 5663, yearBuilt: 2006, salePrice: 749000, saleDate: "2025-12-22", propertyType: "townhouse", features: ["gated_community", "garage_2"] },
  { address: "5102 Balcones Dr", city: "Austin", zip: "78731", lat: 30.3599, lng: -97.7602, beds: 4, baths: 3, sqft: 2720, lotSqft: 12197, yearBuilt: 1968, salePrice: 895000, saleDate: "2026-01-20", propertyType: "single_family", features: ["pool", "large_lot", "no_hoa"] },
  { address: "2801 Webberville Rd", city: "Austin", zip: "78702", lat: 30.2589, lng: -97.7012, beds: 2, baths: 2, sqft: 1180, lotSqft: 0, yearBuilt: 2020, salePrice: 499000, saleDate: "2025-11-02", propertyType: "condo", features: ["new_construction", "high_walk_score"] },
  { address: "11204 Hazel Crest Dr", city: "Austin", zip: "78750", lat: 30.4511, lng: -97.7938, beds: 4, baths: 3.5, sqft: 3200, lotSqft: 10454, yearBuilt: 2002, salePrice: 658000, saleDate: "2026-02-12", propertyType: "single_family", features: ["game_room", "formal_dining", "garage_3"] },
];

// ─── camelCase → snake_case mappers ──────────────────────────────────────────

function mapProperty(p: (typeof activeListings)[number]): Record<string, unknown> {
  return {
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
  };
}

function mapComp(c: (typeof soldComps)[number]): Record<string, unknown> {
  return {
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
  };
}

// ─── Run Seed ─────────────────────────────────────────────────────────────────

export async function runSeed(): Promise<void> {
  console.log("Starting HomeIQ seed...");

  console.log(`  Inserting ${activeListings.length} active listings...`);
  await insert("properties", activeListings.map(mapProperty));
  console.log("  Properties seeded");

  console.log(`  Inserting ${soldComps.length} sold comps...`);
  await insert("sold_comps", soldComps.map(mapComp));
  console.log("  Sold comps seeded");

  console.log("Seed complete!");
}

// Allow running directly: npx tsx lib/data/seed.ts
runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
