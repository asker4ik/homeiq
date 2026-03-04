import Link from "next/link";
import { Home, Search, DollarSign, FileText } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 bg-background">
      <div className="max-w-2xl w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Home className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">HomeIQ</h1>
        </div>

        <p className="text-xl text-muted-foreground mb-2">
          Buy your first home in Texas — without a realtor.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          AI-powered comps, offer guidance, and TREC form walkthrough. Flat $499 fee, paid only on close.
        </p>

        <Link
          href="/properties"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Search className="h-4 w-4" />
          Browse Active Listings
        </Link>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: Search,
              title: "Find the right home",
              desc: "Browse active listings with real comps data from recent sales in the same neighborhood.",
            },
            {
              icon: DollarSign,
              title: "Know what to pay",
              desc: "Select comparable sold homes and get an AI-generated price range based on real market data.",
            },
            {
              icon: FileText,
              title: "Make an offer",
              desc: "Step-by-step TREC form walkthrough. We explain every field in plain English.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-5 shadow-sm">
              <Icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
