"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Info,
  Home,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OfferSummary } from "./OfferSummary";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Property, PriceRange, TrecFormData } from "@/types";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface WizardForm {
  offerPrice: number;
  earnestMoney: number;
  optionFee: number;
  optionDays: number;
  closingDate: string;
  paymentType: "mortgage" | "cash";
  financingContingency: boolean;
  downPaymentPct: number;
}

interface StepProps {
  form: WizardForm;
  update: (patch: Partial<WizardForm>) => void;
  property: Property;
  priceRange: PriceRange | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Offer Price",
  "Earnest Money",
  "Option Period",
  "Financing",
  "Closing Date",
  "Review",
];

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : n}
                </div>
                <span
                  className={cn(
                    "hidden sm:block text-xs text-center whitespace-nowrap",
                    active ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {/* Connector */}
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={cn(
                    "mb-5 h-px flex-1 mx-1 transition-colors",
                    done ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Mobile: current step label */}
      <p className="sm:hidden text-sm font-semibold text-foreground text-center">
        Step {current} of {STEP_LABELS.length}: {STEP_LABELS[current - 1]}
      </p>
    </div>
  );
}

// ─── Callout box ──────────────────────────────────────────────────────────────

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
      <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
      <p className="text-sm text-blue-900 leading-relaxed">{children}</p>
    </div>
  );
}

// ─── Step 1: Offer Price ──────────────────────────────────────────────────────

function StepOfferPrice({ form, update, property, priceRange }: StepProps) {
  const diff = form.offerPrice > 0 ? form.offerPrice - property.listPrice : 0;
  const diffPct = property.listPrice > 0
    ? ((Math.abs(diff) / property.listPrice) * 100).toFixed(1)
    : "0";

  const tiers = priceRange
    ? [
        {
          key: "conservative" as const,
          label: "Conservative",
          sublabel: "Below market",
          amount: priceRange.conservative,
          base: "border-blue-200 bg-blue-50",
          active: "border-blue-500 bg-blue-100 ring-2 ring-blue-300",
          labelColor: "text-blue-700",
        },
        {
          key: "fair" as const,
          label: "Fair Market",
          sublabel: "At market value",
          amount: priceRange.fair,
          base: "border-emerald-200 bg-emerald-50",
          active: "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300",
          labelColor: "text-emerald-700",
        },
        {
          key: "aggressive" as const,
          label: "Aggressive",
          sublabel: "Competitive offer",
          amount: priceRange.aggressive,
          base: "border-orange-200 bg-orange-50",
          active: "border-orange-500 bg-orange-100 ring-2 ring-orange-300",
          labelColor: "text-orange-700",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">What&apos;s your offer price?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The seller is asking{" "}
          <span className="font-semibold text-foreground">
            {formatPrice(property.listPrice)}
          </span>
          .{" "}
          {priceRange
            ? "Based on recent comparable sales, here are three strategic price points."
            : "Enter the amount you'd like to offer."}
        </p>
      </div>

      {tiers.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {tiers.map((tier) => (
            <button
              key={tier.key}
              type="button"
              onClick={() => update({ offerPrice: tier.amount })}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                form.offerPrice === tier.amount ? tier.active : tier.base
              )}
            >
              <p className={cn("text-xs font-semibold uppercase tracking-wide", tier.labelColor)}>
                {tier.label}
              </p>
              <p className="text-base font-bold text-foreground mt-1">
                {formatPrice(tier.amount)}
              </p>
              <p className="text-xs text-muted-foreground">{tier.sublabel}</p>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="offerPrice">
          {tiers.length > 0 ? "Or enter a custom amount" : "Offer amount"}
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            id="offerPrice"
            type="number"
            className="pl-7"
            placeholder="490000"
            value={form.offerPrice || ""}
            onChange={(e) => update({ offerPrice: Number(e.target.value) })}
          />
        </div>
        {form.offerPrice > 0 && diff !== 0 && (
          <p
            className={cn(
              "text-sm font-medium",
              diff < 0 ? "text-emerald-600" : "text-orange-600"
            )}
          >
            {diff < 0 ? "↓" : "↑"} {diffPct}% {diff < 0 ? "below" : "above"} asking
            price ({diff < 0 ? "−" : "+"}
            {formatPrice(Math.abs(diff))})
          </p>
        )}
        {form.offerPrice > 0 && diff === 0 && (
          <p className="text-sm text-muted-foreground">
            Matching the asking price exactly.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Earnest Money ────────────────────────────────────────────────────

function StepEarnestMoney({ form, update }: StepProps) {
  const suggested = Math.round((form.offerPrice * 0.01) / 500) * 500;
  const pct =
    form.earnestMoney > 0 && form.offerPrice > 0
      ? ((form.earnestMoney / form.offerPrice) * 100).toFixed(2)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Earnest money deposit</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Earnest money shows the seller you&rsquo;re serious. It goes into escrow
          (held by the title company) and is applied to your purchase price at
          closing.
        </p>
      </div>

      <Callout>
        <strong>If you back out during the option period, you get your earnest money back.</strong>{" "}
        You only lose it if you cancel the contract after the option period ends for
        a reason not covered by a contingency.
      </Callout>

      <div className="space-y-2">
        <Label htmlFor="earnestMoney">Earnest money amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            id="earnestMoney"
            type="number"
            className="pl-7"
            value={form.earnestMoney || ""}
            onChange={(e) => update({ earnestMoney: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Suggested: 1% of offer price ={" "}
            <button
              type="button"
              onClick={() => update({ earnestMoney: suggested })}
              className="font-semibold text-primary hover:underline"
            >
              {formatPrice(suggested)}
            </button>
          </span>
          {pct && (
            <span>
              {pct}% of offer price
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Typical earnest money in Texas is 1–2% of the purchase price. A higher
        deposit can signal commitment in a competitive market.
      </p>
    </div>
  );
}

// ─── Step 3: Option Period ────────────────────────────────────────────────────

function StepOptionPeriod({ form, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Option period</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Texas gives buyers a unique protection called the{" "}
          <strong>Option Period</strong>. For a small fee paid to the seller,
          you get the right to back out of the deal for{" "}
          <strong>any reason at all</strong> within a set number of days.
        </p>
      </div>

      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
        <div className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Don&rsquo;t skip the option period
            </p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              This is one of the best protections available to Texas buyers. Use
              this window to do your home inspection. If something serious comes
              up — foundation problems, roof damage, anything — you can walk
              away, no questions asked, and keep your earnest money.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="optionFee">Option fee</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              $
            </span>
            <Input
              id="optionFee"
              type="number"
              className="pl-7"
              value={form.optionFee || ""}
              onChange={(e) => update({ optionFee: Number(e.target.value) })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Typical range: $100–$300. Paid directly to the seller within 3 days
            of signing. Non-refundable.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="optionDays">Option period length</Label>
          <div className="relative">
            <Input
              id="optionDays"
              type="number"
              min={1}
              max={21}
              value={form.optionDays || ""}
              onChange={(e) => update({ optionDays: Number(e.target.value) })}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              days
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Typical range: 5–10 days. Longer = more protection, but sellers may
            resist very long option periods in competitive markets.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Financing ────────────────────────────────────────────────────────

function StepFinancing({ form, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">How are you paying?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This affects how the offer is structured and which protections apply
          to you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(
          [
            {
              key: "mortgage" as const,
              title: "Getting a mortgage",
              desc: "You're working with a lender to finance part of the purchase.",
            },
            {
              key: "cash" as const,
              title: "Paying cash",
              desc: "No loan needed. You have the full purchase amount available.",
            },
          ] as const
        ).map(({ key, title, desc }) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              update({
                paymentType: key,
                financingContingency: key === "mortgage",
              })
            }
            className={cn(
              "rounded-xl border-2 p-5 text-left transition-all",
              form.paymentType === key
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {form.paymentType === key && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>

      {form.paymentType === "mortgage" && (
        <div className="space-y-5 rounded-xl border bg-muted/20 p-5">
          <div className="space-y-2">
            <Label htmlFor="downPaymentPct">Down payment percentage</Label>
            <div className="relative">
              <Input
                id="downPaymentPct"
                type="number"
                min={3}
                max={99}
                className="pr-8"
                value={form.downPaymentPct || ""}
                onChange={(e) => update({ downPaymentPct: Number(e.target.value) })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
            {form.offerPrice > 0 && form.downPaymentPct > 0 && (
              <p className="text-xs text-muted-foreground">
                Down payment:{" "}
                <span className="font-semibold text-foreground">
                  {formatPrice(Math.round((form.offerPrice * form.downPaymentPct) / 100))}
                </span>{" "}
                · Loan amount:{" "}
                <span className="font-semibold text-foreground">
                  {formatPrice(
                    form.offerPrice -
                      Math.round((form.offerPrice * form.downPaymentPct) / 100)
                  )}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="financingContingency">Financing contingency</Label>
              <button
                id="financingContingency"
                type="button"
                role="switch"
                aria-checked={form.financingContingency}
                onClick={() =>
                  update({ financingContingency: !form.financingContingency })
                }
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  form.financingContingency ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                    form.financingContingency ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {form.financingContingency ? (
                <>
                  <strong className="text-emerald-700">On (recommended):</strong> If
                  your lender cannot approve the loan, you can cancel the contract
                  and get your earnest money back.
                </>
              ) : (
                <>
                  <strong className="text-red-600">Off:</strong> If your loan falls
                  through after the option period, you could lose your earnest money.
                  Only waive this if you are very confident in your financing.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {form.paymentType === "cash" && (
        <Callout>
          Cash offers are strong — sellers love them because there&rsquo;s no loan
          approval risk. Closing can often happen in as little as 2 weeks. Make
          sure your funds are documented (bank statement) before making a cash
          offer.
        </Callout>
      )}
    </div>
  );
}

// ─── Step 5: Closing Date ─────────────────────────────────────────────────────

function Timeline({
  optionDays,
  closingDate,
}: {
  optionDays: number;
  closingDate: string;
}) {
  const today = new Date();
  const todayIso = today.toISOString().split("T")[0];

  const optionEnd = new Date(today);
  optionEnd.setDate(today.getDate() + Math.max(optionDays, 1));

  const closing = new Date(closingDate || isoDate(35));
  const loanApproval = new Date(closing);
  loanApproval.setDate(closing.getDate() - 14);

  const milestones = [
    { label: "Today", date: shortDate(todayIso), color: "bg-primary" },
    {
      label: "Option ends",
      date: shortDate(optionEnd.toISOString().split("T")[0]),
      color: "bg-amber-500",
    },
    {
      label: "Loan approval",
      date: shortDate(loanApproval.toISOString().split("T")[0]),
      color: "bg-blue-500",
    },
    {
      label: "Closing",
      date: closingDate ? shortDate(closingDate) : "—",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
        Estimated timeline
      </p>
      <div className="relative">
        <div className="absolute top-4 left-4 right-4 h-px bg-border" />
        <div className="relative flex justify-between">
          {milestones.map(({ label, date, color }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 max-w-[70px]">
              <div
                className={cn(
                  "h-3 w-3 rounded-full border-2 border-white z-10",
                  color
                )}
              />
              <p className="text-xs font-medium text-foreground text-center leading-tight">
                {label}
              </p>
              <p className="text-xs text-muted-foreground text-center">{date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepClosingDate({ form, update }: StepProps) {
  const minDate = isoDate(14);
  const maxDate = isoDate(120);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">When do you want to close?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Closing is the day you sign the final paperwork, pay the balance, and
          receive the keys. In Texas, most closings take{" "}
          <strong>30–45 days</strong> from an accepted offer — this gives your
          lender time to process the loan and the title company to prepare the
          documents.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="closingDate">Closing date</Label>
        <Input
          id="closingDate"
          type="date"
          min={minDate}
          max={maxDate}
          value={form.closingDate}
          onChange={(e) => update({ closingDate: e.target.value })}
          className="w-full"
        />
        {form.closingDate && (
          <p className="text-xs text-muted-foreground">
            That&rsquo;s{" "}
            {Math.round(
              (new Date(form.closingDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            days from today ({formatDate(form.closingDate)})
          </p>
        )}
      </div>

      {form.closingDate && (
        <Timeline optionDays={form.optionDays} closingDate={form.closingDate} />
      )}

      <Callout>
        A flexible closing date can be a negotiating advantage. If the seller
        needs time to move, offering a later date may make your offer more
        attractive — even if the price is slightly lower.
      </Callout>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  property,
  offerId,
  trecFormData,
}: {
  property: Property;
  form: WizardForm;
  offerId: string;
  trecFormData: TrecFormData;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch("/api/offer/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trecFormData),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `offer-${property.address.replace(/\s+/g, "-").slice(0, 40)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="text-center py-8 space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-9 w-9 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">Offer prepared!</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Your offer document for{" "}
          <span className="font-medium text-foreground">{property.address}</span>{" "}
          has been generated. Reference ID:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
            {offerId.slice(0, 8)}
          </code>
        </p>
      </div>

      <div className="rounded-xl border bg-amber-50 border-amber-200 p-4 max-w-md mx-auto text-left">
        <p className="text-sm font-semibold text-amber-900 mb-1">
          Before submitting your offer
        </p>
        <ul className="space-y-1 text-xs text-amber-800">
          <li>• Add your full legal name and the seller&rsquo;s name to the form</li>
          <li>• Have your lender provide a pre-approval letter (if mortgage)</li>
          <li>• Confirm earnest money wire instructions with the title company</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/properties/${property.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to property
        </Link>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Generating PDF…" : "Download TREC Offer Form"}
        </button>
      </div>

      {downloadError && (
        <p className="text-sm text-destructive">{downloadError}</p>
      )}

      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
        PDF includes a formatted offer summary + the blank TREC 20-17 form (11 pages) ready to complete and submit.
      </p>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

interface Props {
  property: Property;
  priceRange: PriceRange | null;
}

export function OfferWizard({ property, priceRange }: Props) {
  const defaultOffer = priceRange?.fair ?? property.listPrice;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [form, setForm] = useState<WizardForm>({
    offerPrice: defaultOffer,
    earnestMoney: Math.round((defaultOffer * 0.01) / 500) * 500,
    optionFee: 200,
    optionDays: 7,
    closingDate: isoDate(35),
    paymentType: "mortgage",
    financingContingency: true,
    downPaymentPct: 20,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    offerId: string;
    trecFormData: TrecFormData;
  } | null>(null);

  function update(patch: Partial<WizardForm>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1: return form.offerPrice > 0;
      case 2: return form.earnestMoney > 0;
      case 3: return form.optionFee > 0 && form.optionDays > 0;
      case 4: return !!form.paymentType;
      case 5: return !!form.closingDate;
      default: return true;
    }
  }

  async function handleGenerate() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          propertyAddress: `${property.address}, ${property.city}, TX ${property.zip}`,
          ...form,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to generate offer");
      setSubmitted({ offerId: json.data.offerId, trecFormData: json.data.trecFormData });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SuccessScreen property={property} form={form} offerId={submitted.offerId} trecFormData={submitted.trecFormData} />
    );
  }

  const stepProps: StepProps = { form, update, property, priceRange };

  return (
    <div className="space-y-8">
      <ProgressBar current={step} />

      <div className="min-h-[420px]">
        {step === 1 && <StepOfferPrice {...stepProps} />}
        {step === 2 && <StepEarnestMoney {...stepProps} />}
        {step === 3 && <StepOptionPeriod {...stepProps} />}
        {step === 4 && <StepFinancing {...stepProps} />}
        {step === 5 && <StepClosingDate {...stepProps} />}
        {step === 6 && <OfferSummary form={form} property={property} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={() => setStep((s) => (s - 1) as typeof step)}
          disabled={step === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <span className="text-xs text-muted-foreground">
          Step {step} of {STEP_LABELS.length}
        </span>

        {step < 6 ? (
          <Button
            onClick={() => setStep((s) => (s + 1) as typeof step)}
            disabled={!canAdvance()}
            className="gap-1"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={submitting} className="gap-2">
            {submitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Generate Offer Document
              </>
            )}
          </Button>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-destructive text-center">{submitError}</p>
      )}
    </div>
  );
}
