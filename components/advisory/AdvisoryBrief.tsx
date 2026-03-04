"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import type { AdvisoryBrief as AdvisoryBriefType } from "@/types";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonLine({ width = "full" }: { width?: string }) {
  return (
    <div className={`h-3.5 rounded bg-muted animate-pulse w-${width}`} />
  );
}

function AdvisoryBriefSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="border-b bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <div className="h-4 w-40 rounded bg-primary/20 animate-pulse" />
        </div>
        <div className="mt-1 h-3 w-56 rounded bg-muted animate-pulse" />
      </div>
      <div className="divide-y">
        {[
          { label: "Summary", lines: 3 },
          { label: "Red Flags", lines: 2 },
          { label: "Strengths", lines: 2 },
          { label: "Neighborhood", lines: 2 },
        ].map(({ label, lines }) => (
          <div key={label} className="px-5 py-4 space-y-2">
            <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
            {Array.from({ length: lines }).map((_, i) => (
              <SkeletonLine
                key={i}
                width={i === lines - 1 ? "4/5" : "full"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Display ──────────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-b last:border-0">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function AdvisoryBriefDisplay({ brief }: { brief: AdvisoryBriefType }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            AI Property Analysis
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Powered by Claude · Based on property data and comparable sales
        </p>
      </div>

      <div className="divide-y">
        {/* Summary */}
        <Section
          icon={<Sparkles className="h-4 w-4 text-primary" />}
          title="Overview"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            {brief.summary}
          </p>
        </Section>

        {/* Red flags */}
        {brief.redFlags.length > 0 && (
          <Section
            icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
            title="Watch Out For"
          >
            <ul className="space-y-2">
              {brief.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground leading-snug">
                    {flag}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Positives */}
        {brief.positives.length > 0 && (
          <Section
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            title="Strengths"
          >
            <ul className="space-y-2">
              {brief.positives.map((positive, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground leading-snug">
                    {positive}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Neighborhood context */}
        {brief.neighborhoodContext && (
          <Section
            icon={<MapPin className="h-4 w-4 text-blue-500" />}
            title="Neighborhood Context"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              {brief.neighborhoodContext}
            </p>
          </Section>
        )}

        {/* Bidding strategy */}
        {brief.biddingStrategy && (
          <Section
            icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
            title="Market Position"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              {brief.biddingStrategy}
            </p>
            <p className="mt-2 text-xs text-muted-foreground italic">
              This reflects market context only — you decide what to offer.
            </p>
          </Section>
        )}

        {/* Questions to ask */}
        {brief.questionsToAsk.length > 0 && (
          <Section
            icon={<ClipboardList className="h-4 w-4 text-purple-500" />}
            title="Questions to Ask"
          >
            <ul className="space-y-2">
              {brief.questionsToAsk.map((q, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-background text-xs font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground leading-snug">{q}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function AdvisoryBriefError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          AI Property Analysis
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:underline"
      >
        <RefreshCw className="h-3 w-3" />
        Try again
      </button>
    </div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

interface Props {
  propertyId: string;
  compIds?: string[];
}

export function AdvisoryBrief({ propertyId, compIds }: Props) {
  const [brief, setBrief] = useState<AdvisoryBriefType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchBrief() {
      setLoading(true);
      setError(null);
      setBrief(null);

      try {
        const res = await fetch("/api/advisory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId, compIds }),
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "");
          throw new Error(
            text
              ? JSON.parse(text)?.error ?? text
              : `Request failed (${res.status})`
          );
        }

        // Accumulate the stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
        }

        if (cancelled) return;

        // Strip any accidental markdown fences Claude might add
        const cleaned = accumulated
          .trim()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "");

        const parsed: AdvisoryBriefType = JSON.parse(cleaned);
        setBrief(parsed);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBrief();
    return () => {
      cancelled = true;
    };
  }, [propertyId, compIds, attempt]);

  if (loading) return <AdvisoryBriefSkeleton />;
  if (error)
    return (
      <AdvisoryBriefError
        message={error}
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  if (!brief) return null;

  return <AdvisoryBriefDisplay brief={brief} />;
}
