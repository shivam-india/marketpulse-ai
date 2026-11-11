import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketPulse AI — Global Financial Market Analysis & Outlook Platform",
  description:
    "Institutional research terminal providing probabilistic market outlook, multi-timeframe confluence, order flow, liquidity heatmap, and macroeconomic intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#06090e] text-[#f1f5f9] antialiased min-h-screen selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}

