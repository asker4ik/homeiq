import { formatPrice, formatDate } from "@/lib/utils";
import type { Property } from "@/types";
import type { WizardForm } from "./OfferWizard";

interface Props {
  form: WizardForm;
  property: Property;
}

interface SummaryRow {
  label: string;
  value: string;
  trec: string;
  explanation: string;
  highlight?: boolean;
}

export function OfferSummary({ form, property }: Props) {
  const downPaymentAmount = Math.round((form.offerPrice * form.downPaymentPct) / 100);
  const loanAmount = form.offerPrice - downPaymentAmount;

  const rows: SummaryRow[] = [
    {
      label: "Offer Price",
      value: formatPrice(form.offerPrice),
      trec: "Section 3",
      explanation: `You're offering ${
        form.offerPrice < property.listPrice
          ? `${formatPrice(property.listPrice - form.offerPrice)} below`
          : form.offerPrice > property.listPrice
          ? `${formatPrice(form.offerPrice - property.listPrice)} above`
          : "exactly at"
      } the asking price of ${formatPrice(property.listPrice)}.`,
    },
    {
      label: "Earnest Money",
      value: formatPrice(form.earnestMoney),
      trec: "Section 5",
      explanation:
        "Held in escrow by the title company. Applied to your purchase at closing. Refundable if you cancel during the option period.",
    },
    {
      label: "Option Fee",
      value: formatPrice(form.optionFee),
      trec: "Section 23",
      explanation: `Paid directly to the seller within 3 days of signing. Gives you ${form.optionDays} days to back out for any reason. Non-refundable, but typically small.`,
      highlight: true,
    },
    {
      label: "Option Period",
      value: `${form.optionDays} days`,
      trec: "Section 23",
      explanation:
        "Your unrestricted right to cancel the contract for any reason. Use this time to do the inspection and review any issues.",
    },
    {
      label: "Financing",
      value:
        form.paymentType === "cash"
          ? "Cash purchase"
          : `Mortgage — ${form.downPaymentPct}% down (${formatPrice(downPaymentAmount)}), loan ${formatPrice(loanAmount)}`,
      trec: "Section 3 & 22",
      explanation:
        form.paymentType === "cash"
          ? "No loan needed. Sellers often prefer cash offers — they close faster with fewer contingencies."
          : form.financingContingency
          ? "If your lender cannot approve the loan, you can cancel and get your earnest money back."
          : "No financing contingency — if your loan falls through, you may lose your earnest money.",
      highlight: form.paymentType === "mortgage" && !form.financingContingency,
    },
    {
      label: "Closing Date",
      value: formatDate(form.closingDate),
      trec: "Section 9",
      explanation:
        "The date you sign final papers, pay the remaining balance, and receive the keys. Settlement happens at the title company.",
    },
    {
      label: "Title Policy",
      value: "Paid by seller",
      trec: "Section 6",
      explanation:
        "Standard in Texas — the seller pays for the owner's title insurance policy. This protects you from undisclosed liens or ownership disputes.",
    },
    {
      label: "Buyer's Agent",
      value: "None (HomeIQ)",
      trec: "Section 4",
      explanation:
        "You are purchasing without a traditional buyer's agent. HomeIQ is not a licensed real estate agent.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Property header */}
      <div className="rounded-xl border bg-muted/30 px-5 py-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
          Property
        </p>
        <p className="font-bold text-foreground">
          {property.address}
        </p>
        <p className="text-sm text-muted-foreground">
          {property.city}, TX {property.zip} · Asking {formatPrice(property.listPrice)}
        </p>
      </div>

      {/* Summary rows */}
      <div className="rounded-xl border overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`px-5 py-4 ${i < rows.length - 1 ? "border-b" : ""} ${
              row.highlight ? "bg-amber-50 border-l-4 border-l-amber-400" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {row.label}
                  </p>
                  <span className="text-xs text-muted-foreground rounded border px-1.5 py-0.5 bg-muted/40 font-mono">
                    TREC {row.trec}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {row.explanation}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground shrink-0 text-right">
                {row.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* What happens next */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          What happens after you submit
        </h3>
        <ol className="space-y-3">
          {[
            {
              step: "Offer delivery",
              desc: "HomeIQ sends your offer to the seller's agent. Standard Texas contracts give the seller 24–48 hours to respond.",
            },
            {
              step: "Seller responds",
              desc: "They can accept, reject, or counter your offer. A counteroffer is common — you can negotiate price, terms, or closing date.",
            },
            {
              step: "If accepted: earnest money",
              desc: `You wire ${formatPrice(form.earnestMoney)} to the title company within 3 days of a signed contract.`,
            },
            {
              step: `Option period starts (${form.optionDays} days)`,
              desc: `Schedule your home inspection now. You can back out for any reason and keep your earnest money — you only lose the $${form.optionFee} option fee.`,
            },
            {
              step: "Financing & appraisal",
              desc:
                form.paymentType === "cash"
                  ? "No loan needed. Work with the title company to finalize your closing paperwork."
                  : "Your lender orders the appraisal and works toward loan approval. Stay responsive — they'll need documents quickly.",
            },
            {
              step: `Closing day: ${formatDate(form.closingDate)}`,
              desc: "You sign all final documents at the title company, pay the remaining balance, and receive the keys.",
            },
          ].map(({ step, desc }, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{step}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
