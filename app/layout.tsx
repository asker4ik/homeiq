import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeIQ — Buy Your Home Without a Realtor",
  description:
    "HomeIQ helps first-time buyers in Texas purchase homes confidently — without a buyer's agent. AI-powered comps, offer guidance, and TREC form walkthrough for a flat $499.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
