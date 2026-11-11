"use client";

import React from "react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { AssetInfo } from "@/types/market";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TickerBarProps {
  onSelectAsset: (asset: AssetInfo) => void;
  activeSymbol: string;
}

export function TickerBar({ onSelectAsset, activeSymbol }: TickerBarProps) {
  const [marqueeAssets, setMarqueeAssets] = React.useState<AssetInfo[]>(
    SUPPORTED_ASSETS.slice(0, 10)
  );

  React.useEffect(() => {
    async function loadTicker() {
      try {
        const res = await fetch("/api/markets/quotes");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setMarqueeAssets(json.data.slice(0, 10));
        }
      } catch {
        // keep existing
      }
    }
    loadTicker();
    const interval = setInterval(loadTicker, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#080c14] border-b border-white/5 overflow-x-auto no-scrollbar py-1 px-2 flex items-center space-x-2 text-xs font-mono">
      <div className="flex items-center space-x-1 pl-2 pr-3 py-0.5 rounded bg-white/5 text-[10px] uppercase font-bold text-slate-400 shrink-0 border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
        <span>TICKER FEED</span>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        {marqueeAssets.map((asset) => {
          const isSelected = asset.symbol === activeSymbol;
          const isPositive = asset.change24hPercent >= 0;

          return (
            <button
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className={`flex items-center space-x-2 px-2.5 py-1 rounded text-left transition-all border shrink-0 ${
                isSelected
                  ? "bg-sky-500/20 border-sky-500/40 text-white shadow-sm"
                  : "bg-white/[0.03] hover:bg-white/[0.08] border-white/5 text-slate-300"
              }`}
            >
              <span className="font-bold text-white text-[11px]">{asset.symbol}</span>
              <span className="text-slate-200 font-mono text-[11px]">
                {asset.currentPrice.toFixed(asset.decimals)}
              </span>
              <span
                className={`flex items-center text-[10px] font-bold ${
                  isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {isPositive ? "+" : ""}
                {asset.change24hPercent}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

