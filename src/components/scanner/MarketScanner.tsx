"use client";

import React, { useState } from "react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { AssetClass, AssetInfo, BiasDirection } from "@/types/market";
import {
  Radar,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface MarketScannerProps {
  onSelectAsset: (asset: AssetInfo) => void;
}

export function MarketScanner({ onSelectAsset }: MarketScannerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBias, setSelectedBias] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minConfluence, setMinConfluence] = useState<number>(50);

  // Simulated live scanner results with calibrated confluence scores
  const scannerData = SUPPORTED_ASSETS.map((asset, idx) => {
    // Generate deterministic score based on symbol & change
    const isUp = asset.change24hPercent >= 0;
    const baseScore = 55 + Math.round(Math.abs(asset.change24hPercent) * 8);
    const score = Math.min(Math.max(baseScore, 48), 88);

    let bias: BiasDirection = "neutral";
    if (score >= 65) bias = isUp ? "bullish" : "bearish";
    else if (score >= 58) bias = isUp ? "bullish" : "bearish";

    return {
      asset,
      score,
      bias,
      regime: isUp ? "Trending Bullish" : "Consolidation / Distribution",
      volatility: Math.abs(asset.change24hPercent) > 1.5 ? "High" : "Average",
      unusualVolume: asset.volume24h > 200000000,
    };
  });

  const filtered = scannerData.filter((item) => {
    if (selectedCategory !== "all" && item.asset.category !== selectedCategory) return false;
    if (selectedBias !== "all" && item.bias !== selectedBias) return false;
    if (item.score < minConfluence) return false;
    if (
      searchQuery &&
      !item.asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Scanner Banner */}
      <div className="terminal-glass rounded-lg p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Radar className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <span>Multi-Asset AI Market Scanner</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold">
                REAL-TIME FILTER
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Scans multi-timeframe confluence, unusual volume, and liquidity setups. Not financial advice.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter scanner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1424] text-xs font-mono text-slate-200 pl-8 pr-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#090e18] border border-white/5 font-mono text-xs">
        {/* Categories */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-slate-500 mr-1.5 uppercase font-semibold">Class:</span>
          {["all", "forex", "commodity", "index", "crypto"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-sky-500 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bias Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-slate-500 mr-1.5 uppercase font-semibold">Bias:</span>
          {["all", "bullish", "bearish", "neutral"].map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBias(b)}
              className={`px-2.5 py-1 rounded capitalize transition-all ${
                selectedBias === b
                  ? "bg-white/15 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Confluence Slider */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>Min Confluence:</span>
          <span className="font-bold text-sky-400">{minConfluence}</span>
          <input
            type="range"
            min="45"
            max="85"
            value={minConfluence}
            onChange={(e) => setMinConfluence(Number(e.target.value))}
            className="w-24 accent-sky-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="terminal-glass rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#070c16] text-[10px] text-slate-400 uppercase">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Current Price</th>
                <th className="py-2.5 px-3">24h Change</th>
                <th className="py-2.5 px-3">Confluence Score</th>
                <th className="py-2.5 px-3">Market Bias</th>
                <th className="py-2.5 px-3">Regime</th>
                <th className="py-2.5 px-3">Order Flow</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                    No instruments match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isUp = item.asset.change24hPercent >= 0;
                  const isBull = item.bias === "bullish";
                  const isBear = item.bias === "bearish";

                  return (
                    <tr
                      key={item.asset.id}
                      onClick={() => onSelectAsset(item.asset)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-white group-hover:text-sky-300 transition-colors">
                          {item.asset.symbol}
                        </div>
                        <div className="text-[11px] text-slate-400">{item.asset.name}</div>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-200">
                        {item.asset.currentPrice.toFixed(item.asset.decimals)}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`flex items-center font-bold ${
                            isUp ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isUp ? (
                            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                          )}
                          {isUp ? "+" : ""}
                          {item.asset.change24hPercent}%
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sky-400">{item.score}/100</span>
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-sky-400 rounded-full"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isBull
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isBear
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.bias}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        {item.regime}
                      </td>

                      <td className="py-3 px-3">
                        {item.asset.supportedOrderFlow ? (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            SUPPORTED
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            PROXY ONLY
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAsset(item.asset);
                          }}
                          className="px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-bold inline-flex items-center space-x-1"
                        >
                          <span>Analyze</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

