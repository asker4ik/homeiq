import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import type { TrecFormData } from "@/types";

interface RequestBody {
  propertyId: string;
  propertyAddress: string;
  offerPrice: number;
  earnestMoney: number;
  optionFee: number;
  optionDays: number;
  closingDate: string;
  paymentType: "mortgage" | "cash";
  financingContingency: boolean;
  downPaymentPct: number;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const {
    propertyAddress,
    offerPrice,
    earnestMoney,
    optionFee,
    optionDays,
    closingDate,
    paymentType,
    financingContingency,
    downPaymentPct,
  } = body;

  if (!offerPrice || offerPrice <= 0) {
    return NextResponse.json(
      { data: null, error: "offerPrice is required" },
      { status: 400 }
    );
  }

  const cashDown =
    paymentType === "cash"
      ? offerPrice
      : Math.round((offerPrice * downPaymentPct) / 100);

  const financingAmount =
    paymentType === "cash" ? 0 : offerPrice - cashDown;

  const trecFormData: TrecFormData = {
    // Section 1 — Parties (buyer fills in before printing)
    buyerName: "",
    sellerName: "",
    // Section 2 — Property
    propertyAddress,
    legalDescription: "",
    // Section 3 — Sales Price
    offerPrice,
    cashDown,
    financingAmount,
    // Section 4 — License Holder Disclosure
    buyerRepresented: false, // HomeIQ is not a licensed agent
    // Section 5 — Earnest Money
    earnestMoney,
    earnestMoneyHolder: "First American Title",
    // Section 6 — Title Policy (seller typically pays in Texas)
    titlePolicyPaidBy: "seller",
    // Section 9 — Closing
    closingDate,
    possessionDate: closingDate,
    // Section 23 — Option Period
    optionFee,
    optionDays,
    // Section 22 — Financing Contingency
    financingContingency: paymentType === "mortgage" ? financingContingency : false,
    additionalProvisions: "",
  };

  // TODO: Persist to Supabase once auth is implemented (Phase 3 of build order).
  // The offers table requires a valid user_id FK to auth.users, so DB writes
  // are deferred until the authentication flow is complete.
  const offerId = randomUUID();

  return NextResponse.json({ data: { offerId, trecFormData }, error: null });
}
