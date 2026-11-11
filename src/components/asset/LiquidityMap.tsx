"use client";

import React, { useState } from "react";
import { LiquidityPool, AssetInfo } from "@/types/market";
import { Droplets, AlertCircle, Target, Layers } from "lucide-react";

interface RealLiquidityData {
  isAvailable: boolean;
  providerName: string;
  bidLiquidityUSD: number;
  askLiquidityUSD: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
  bids: { price: number; quantity: number; totalUSD: number }[];
  asks: { price: number; quantity: number; totalUSD: number }[];
  notice: string;
}

interface LiquidityMapProps {
  pools: LiquidityPool[];
  asset: AssetInfo;
  realLiquidity?: RealLiquidityData;
}

export function LiquidityMap({ pools, asset, realLiquidity }: LiquidityMapProps) {
  const isDirect = realLiquidity?.isAvailable ?? asset.supportedLiquidityDepth;
  const [activeTab, setActiveTab] = useState<"dom" | "pools">(isDirect ? "dom" : "pools");

  return (
    <div className="terminal-glass rounded-lg p-4 space-y-4 border border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
            Liquidity Intelligence & Depth
          </h3>
        </div>

        {/* Tab switch if real DOM is available */}
        <div className="flex items-center space-x-2">
          {isDirect && (
            <div className="flex items-center space-x-1 font-mono text-[10px] bg-black/40 p-0.5 rounded border border-white/5">
              <button
                onClick={() => setActiveTab("dom")}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeTab === "dom" ? "bg-sky-500 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                L2 DOM Book
              </button>
              <button
                onClick={() => setActiveTab("pools")}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeTab === "pools" ? "bg-sky-500 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Target Pools
              </button>
            </div>
          )}

          {/* Honest Disclosure Tag */}
          <div className="flex items-center space-x-1.5 font-mono text-[10px]">
            {isDirect ? (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                LIVE L2 DOM DEPTH
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span>ESTIMATED PROXY</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {!isDirect && (
        <div className="p-2.5 rounded bg-amber-500/[0.06] border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed font-mono text-[11px] space-y-1">
          <div className="font-bold flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>True order-book liquidity data is not available for this instrument/provider.</span>
          </div>
          <p className="text-slate-300 text-[10px]">
            Level-2/Level-3 direct order-book depth feeds require dedicated futures/ECN connectivity.
            The liquidity concentrations below represent algorithmic swing targets derived from pivot highs/lows.
          </p>
        </div>
      )}

      {/* When real L2 DOM is available and tab is DOM */}
      {isDirect && realLiquidity && activeTab === "dom" && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-300 p-2 rounded bg-white/[0.02] border border-white/5">
            <div>
              <span className="text-slate-400">Total Bids: </span>
              <strong className="text-emerald-400">
                ${(realLiquidity.bidLiquidityUSD / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Spread: </span>
              <strong className="text-white">{realLiquidity.spread}</strong>
            </div>
            <div>
              <span className="text-slate-400">Total Asks: </span>
              <strong className="text-rose-400">
                ${(realLiquidity.askLiquidityUSD / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Bids column */}
            <div className="space-y-1">
              <div className="text-[10px] text-emerald-400 font-bold uppercase pb-1 border-b border-emerald-500/20">
                Bids (Buyers)
              </div>
              <div className="space-y-0.5 max-h-[180px] overflow-y-auto no-scrollbar">
                {realLiquidity.bids.slice(0, 8).map((b, i) => (
                  <div key={i} className="flex justify-between items-center py-0.5 px-1 rounded hover:bg-emerald-500/10">
                    <span className="text-emerald-300 font-bold">{b.price.toFixed(asset.decimals)}</span>
                    <span className="text-slate-400 text-[10px]">{b.quantity.toFixed(3)}</span>
                    <span className="text-slate-300 text-[10px]">${Math.round(b.totalUSD).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asks column */}
            <div className="space-y-1">
              <div className="text-[10px] text-rose-400 font-bold uppercase pb-1 border-b border-rose-500/20">
                Asks (Sellers)
              </div>
              <div className="space-y-0.5 max-h-[180px] overflow-y-auto no-scrollbar">
                {realLiquidity.asks.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex justify-between items-center py-0.5 px-1 rounded hover:bg-rose-500/10">
                    <span className="text-rose-300 font-bold">{a.price.toFixed(asset.decimals)}</span>
                    <span className="text-slate-400 text-[10px]">{a.quantity.toFixed(3)}</span>
                    <span className="text-slate-300 text-[10px]">${Math.round(a.totalUSD).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Pools Table (Shown when activeTab === "pools" or when real DOM is unavailable) */}
      {(!isDirect || activeTab === "pools") && (
        <>
          {/* Visual Liquidity Concentration Heatmap Bar */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex justify-between">
              <span>Relative Liquidity Density Spectrum</span>
              <span>Current Price: {asset.currentPrice.toFixed(asset.decimals)}</span>
            </div>
            <div className="h-6 w-full rounded bg-gradient-to-r from-rose-600/40 via-sky-500/30 to-emerald-600/40 border border-white/10 relative overflow-hidden flex items-center justify-center">
              <div className="text-[10px] font-mono text-slate-300 font-bold tracking-widest uppercase">
                RESTING SELL STOPS ◄─── VALUE AREA ───► RESTING BUY STOPS
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase">
                  <th className="py-1.5 px-2">Pool Type</th>
                  <th className="py-1.5 px-2">Price Level</th>
                  <th className="py-1.5 px-2">Distance</th>
                  <th className="py-1.5 px-2">Est. Liquidity</th>
                  <th className="py-1.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-3 text-center text-slate-500 italic">
                      No prominent liquidity pool within current buffer.
                    </td>
                  </tr>
                ) : (
                  pools.slice(0, 6).map((pool) => {
                    const isOverhead = pool.priceLevel > asset.currentPrice;

                    return (
                      <tr key={pool.id} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-2 flex items-center space-x-1.5">
                          <Target className="w-3 h-3 text-sky-400" />
                          <span className="capitalize font-semibold text-slate-200">
                            {pool.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-bold text-white">
                          {pool.priceLevel.toFixed(asset.decimals)}
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`text-[11px] ${
                              isOverhead ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {isOverhead ? "+" : "-"}
                            {Math.abs(pool.distancePips)} pips ({pool.distancePercent}%)
                          </span>
                        </td>
                        <td className="py-2 px-2 text-slate-300">
                          ${(pool.estimatedVolumeUSD / 1000000).toFixed(1)}M
                        </td>
                        <td className="py-2 px-2">
                          {pool.swept ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 line-through">
                              SWEPT
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                              ACTIVE TARGET
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
