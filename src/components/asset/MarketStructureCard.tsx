"use client";

import React from "react";
import { TechnicalAnalysisSummary, AssetInfo } from "@/types/market";
import { GitBranch, Shield, Zap } from "lucide-react";

interface MarketStructureCardProps {
  tech: TechnicalAnalysisSummary;
  asset: AssetInfo;
}

export function MarketStructureCard({ tech, asset }: MarketStructureCardProps) {
  const { marketStructure, trend, signals } = tech;
  const recentBreaks = marketStructure.breaks.slice(-3);
  const recentFVGs = marketStructure.fvgList.slice(-3);

  return (
    <div className="terminal-glass rounded-lg p-4 space-y-4 border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
            Technical Market Structure
          </h3>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span className="text-slate-400">STRUCTURAL STATE:</span>
          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold uppercase border border-sky-500/30">
            {marketStructure.state.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Structural Signals Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2 rounded bg-white/[0.02] border border-white/5">
          <div className="text-[10px] text-slate-400">TREND CLASSIFICATION</div>
          <div className="text-sm font-bold text-white capitalize mt-0.5">
            {trend.replace(/_/g, " ")}
          </div>
        </div>

        <div className="p-2 rounded bg-white/[0.02] border border-white/5">
          <div className="text-[10px] text-slate-400">EMA ALIGNMENT</div>
          <div className={`text-sm font-bold uppercase mt-0.5 ${
            signals.emaAlignment === "bullish" ? "text-emerald-400" : signals.emaAlignment === "bearish" ? "text-rose-400" : "text-amber-400"
          }`}>
            {signals.emaAlignment}
          </div>
        </div>

        <div className="p-2 rounded bg-white/[0.02] border border-white/5">
          <div className="text-[10px] text-slate-400">RSI MOMENTUM (14)</div>
          <div className="text-sm font-bold text-white mt-0.5">
            {tech.indicators.rsi14} ({signals.rsiStatus.replace(/_/g, " ")})
          </div>
        </div>

        <div className="p-2 rounded bg-white/[0.02] border border-white/5">
          <div className="text-[10px] text-slate-400">VOLATILITY EXPANSION</div>
          <div className="text-sm font-bold text-white capitalize mt-0.5">
            {signals.volatilityStatus} (BBW: {tech.indicators.bollingerBands.bandwidth}%)
          </div>
        </div>
      </div>

      {/* Recent Structural Breaks (BOS & CHoCH) */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
          Recent Structural Breaks & Character Shifts
        </div>
        {recentBreaks.length === 0 ? (
          <div className="text-xs text-slate-500 italic">No structural break in current window.</div>
        ) : (
          <div className="space-y-1.5">
            {recentBreaks.map((b, i) => {
              const isBull = b.type.includes("BULL");
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-xs font-mono"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isBull
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {b.type}
                    </span>
                    <span className="text-slate-300">{b.description}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    Level: {b.brokenLevel.toFixed(asset.decimals)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic S/R Clusters Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5">
        {/* Support Clusters */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">
            Institutional Support Zones
          </div>
          {marketStructure.supportLevels.slice(0, 3).map((sup, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-1.5 rounded bg-emerald-500/[0.04] border border-emerald-500/20 text-xs font-mono"
            >
              <span className="font-bold text-white">{sup.price.toFixed(asset.decimals)}</span>
              <span className="text-slate-400 text-[10px]">Touches: {sup.touches}</span>
              <span className="text-emerald-400 text-[10px]">Str: {sup.strength}/10</span>
            </div>
          ))}
        </div>

        {/* Resistance Clusters */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-mono text-rose-400 font-semibold">
            Institutional Resistance Zones
          </div>
          {marketStructure.resistanceLevels.slice(0, 3).map((res, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-1.5 rounded bg-rose-500/[0.04] border border-rose-500/20 text-xs font-mono"
            >
              <span className="font-bold text-white">{res.price.toFixed(asset.decimals)}</span>
              <span className="text-slate-400 text-[10px]">Touches: {res.touches}</span>
              <span className="text-rose-400 text-[10px]">Str: {res.strength}/10</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

