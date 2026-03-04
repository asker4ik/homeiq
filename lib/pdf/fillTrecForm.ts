import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { readFileSync } from "fs";
import path from "path";
import type { TrecFormData } from "@/types";

const TREC_PATH = path.join(process.cwd(), "public/forms/trec-20-17.pdf");

const DARK = rgb(0.1, 0.1, 0.1);
const GRAY = rgb(0.45, 0.45, 0.45);
const LIGHT_GRAY = rgb(0.92, 0.92, 0.92);
const ACCENT = rgb(0.07, 0.45, 0.78);
const AMBER = rgb(0.92, 0.65, 0.1);

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function pct(n: number) {
  return `${n}%`;
}

// ─── Page drawing helpers ──────────────────────────────────────────────────────

function drawRect(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: ReturnType<typeof rgb>
) {
  page.drawRectangle({ x, y, width: w, height: h, color: fill });
}

function drawLine(
  page: PDFPage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = LIGHT_GRAY,
  thickness = 0.5
) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color });
}

function text(
  page: PDFPage,
  str: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = DARK
) {
  page.drawText(str, { x, y, font, size, color });
}

// ─── Summary page layout ───────────────────────────────────────────────────────

function drawSummaryPage(
  page: PDFPage,
  data: TrecFormData,
  regular: PDFFont,
  bold: PDFFont
) {
  const W = 612;
  const L = 36; // left margin
  const R = W - 36; // right edge
  const contentW = R - L;

  // ── Header band ─────────────────────────────────────────────────────────────
  drawRect(page, 0, 752, W, 40, ACCENT);
  text(page, "OFFER TERMS SUMMARY", L, 762, bold, 13, rgb(1, 1, 1));
  text(page, "TREC One to Four Family Residential Contract (RESALE) — Form 20-17", L, 756, regular, 7, rgb(0.85, 0.92, 1));

  // ── Property banner ──────────────────────────────────────────────────────────
  drawRect(page, L, 728, contentW, 20, rgb(0.95, 0.97, 1));
  drawLine(page, L, 728, R, 728, ACCENT, 0.8);
  text(page, "PROPERTY", L + 4, 733, bold, 7, ACCENT);
  text(page, data.propertyAddress, L + 60, 733, regular, 9, DARK);

  // ── Section helper ───────────────────────────────────────────────────────────
  let cursor = 718; // current y, working downward

  function sectionHeader(title: string) {
    cursor -= 14;
    drawRect(page, L, cursor, contentW, 14, LIGHT_GRAY);
    text(page, title.toUpperCase(), L + 4, cursor + 4, bold, 7, GRAY);
    cursor -= 2;
  }

  function row(label: string, value: string, note?: string) {
    cursor -= 18;
    text(page, label, L + 4, cursor + 5, regular, 8, GRAY);
    text(page, value, L + 180, cursor + 5, bold, 9, DARK);
    if (note) {
      text(page, note, L + 320, cursor + 5, regular, 7.5, GRAY);
    }
    drawLine(page, L, cursor, R, cursor);
  }

  // ── Section 1: Parties ───────────────────────────────────────────────────────
  sectionHeader("1 · Parties");
  row("Buyer(s)", data.buyerName || "— fill in before printing —");
  row("Seller(s)", data.sellerName || "— fill in before printing —");

  // ── Section 3: Sales Price ───────────────────────────────────────────────────
  sectionHeader("3 · Sales Price");
  row("Offer price", money(data.offerPrice));
  if (data.financingAmount > 0) {
    row("Cash down", money(data.cashDown), pct(Math.round((data.cashDown / data.offerPrice) * 100)) + " of price");
    row("Financed amount", money(data.financingAmount));
  } else {
    row("Payment method", "All cash", "no financing contingency");
  }

  // ── Section 5: Earnest Money ─────────────────────────────────────────────────
  sectionHeader("5 · Earnest Money");
  row("Earnest money", money(data.earnestMoney), pct(Math.round((data.earnestMoney / data.offerPrice) * 100)) + " of price");
  row("Held by", data.earnestMoneyHolder);

  // ── Section 23: Option Period ────────────────────────────────────────────────
  sectionHeader("23 · Option Period");
  row("Option fee", money(data.optionFee), "due within 3 days of execution");
  row("Option period", `${data.optionDays} calendar days`, "unrestricted right to terminate");

  // ── Section 9: Closing ───────────────────────────────────────────────────────
  sectionHeader("9 · Closing & Possession");
  row("Closing date", fmtDate(data.closingDate));
  row("Possession date", fmtDate(data.possessionDate));

  // ── Section 22: Financing contingency ────────────────────────────────────────
  if (data.financingAmount > 0) {
    sectionHeader("22 · Financing");
    row(
      "Financing contingency",
      data.financingContingency ? "YES — included" : "NO — waived",
      data.financingContingency ? "deal can exit if loan denied" : "buyer accepts loan risk"
    );
  }

  // ── Section 6: Title Policy ───────────────────────────────────────────────────
  sectionHeader("6 · Title Policy");
  row(
    "Title policy paid by",
    data.titlePolicyPaidBy === "seller" ? "Seller (standard TX)" : "Buyer"
  );

  // ── Important notes box ───────────────────────────────────────────────────────
  const noteY = cursor - 24;
  drawRect(page, L, noteY, contentW, 38, rgb(1, 0.98, 0.93));
  drawRect(page, L, noteY, 3, 38, AMBER);
  text(page, "Before submitting this offer:", L + 8, noteY + 28, bold, 8, rgb(0.6, 0.4, 0));
  text(page, "1. Add your full legal name and the seller's name above.", L + 8, noteY + 18, regular, 7.5, DARK);
  text(page, "2. Have your lender provide a pre-approval letter.  3. Confirm earnest money wire details with the title company.", L + 8, noteY + 8, regular, 7.5, DARK);

  // ── Footer ────────────────────────────────────────────────────────────────────
  drawLine(page, L, 28, R, 28, GRAY, 0.3);
  text(page, "Generated by HomeIQ · homeiq.app", L, 18, regular, 7, GRAY);
  text(
    page,
    "This summary is for reference only. Attach the completed TREC 20-17 form (pages 2–12) when submitting.",
    L,
    9,
    regular,
    6.5,
    GRAY
  );

  // ── Page label ───────────────────────────────────────────────────────────────
  text(page, "Page 1 of 12  ·  Summary", R - 80, 9, regular, 7, GRAY);
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function fillTrecForm(data: TrecFormData): Promise<Uint8Array> {
  // Load the blank TREC form
  const trecBytes = readFileSync(TREC_PATH);
  const trecDoc = await PDFDocument.load(trecBytes, { ignoreEncryption: true });

  // Create output document
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: offer summary
  const summaryPage = pdfDoc.addPage([612, 792]);
  drawSummaryPage(summaryPage, data, regular, bold);

  // Pages 2–12: original blank TREC form
  const indices = trecDoc.getPageIndices();
  const copied = await pdfDoc.copyPages(trecDoc, indices);
  for (const page of copied) {
    pdfDoc.addPage(page);
  }

  return pdfDoc.save();
}
