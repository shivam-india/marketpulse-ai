"use client";

import React from "react";
import { AIReasoningOutput } from "@/types/market";
import { Layers, ShieldCheck } from "lucide-react";

interface ConfluenceGaugeProps {
  outlook: AIReasoningOutput;
}

export function ConfluenceGauge({ outlook }: ConfluenceGaugeProps) {
  const { confluenceBreakdown, multiTimeframeViews, confluenceScore, overallBias } = outlook;

  const categories = [
    { label: "MARKET STRUCTURE", value: confluenceBreakdown.marketStructure },
    { label: "MOMENTUM", value: confluenceBreakdown.momentum },
    { label: "MACRO ENVIRONMENT", value: confluenceBreakdown.macro },
    { label: "NEWS SENTIMENT", value: confluenceBreakdown.news },
    { label: "LIQUIDITY PROFILE", value: confluenceBreakdown.liquidity },
    { label: "ORDER FLOW", value: confluenceBreakdown.orderFlow },
  ];

  return (
    <div className="terminal-glass rounded-lg p-4 space-y-4 border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
            Confluence Engine Breakdown
          </h3>
        </div>
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-xs text-slate-400">TOTAL CONFLUENCE:</span>
          <span className="text-sm font-bold text-sky-400">{confluenceScore}/100</span>
        </div>
      </div>

      {/* Terminal ASCII-style Progress Meters */}
      <div className="space-y-2 font-mono text-xs">
        {categories.map((cat) => {
          const blocks = Math.round(cat.value / 10);
          const empty = 10 - blocks;
          const barAscii = "█".repeat(blocks) + "░".repeat(empty);

          return (
            <div key={cat.label} className="flex items-center justify-between space-x-2">
              <span className="text-slate-400 text-[11px] w-40 shrink-0 font-medium">
                {cat.label}
              </span>
              <span className="text-sky-400 tracking-tighter text-xs hidden sm:inline">
                {barAscii}
              </span>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden sm:hidden mx-2">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${cat.value}%` }}
                />
              </div>
              <span className="text-white font-bold w-8 text-right text-xs">
                {cat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Multi-Timeframe Alignment Matrix */}
      <div className="pt-3 border-t border-white/10">
        <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-2">
          Multi-Timeframe Trend & Structure Alignment
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {multiTimeframeViews.map((view) => {
            const isBull = view.bias === "bullish";
            const isBear = view.bias === "bearish";

            return (
              <div
                key={view.timeframe}
                className="p-2 rounded bg-white/[0.03] border border-white/5 font-mono text-center"
              >
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {view.timeframe}
                </div>
                <div
                  className={`text-xs font-bold uppercase mt-1 ${
                    isBull
                      ? "text-emerald-400"
                      : isBear
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {view.bias}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate" title={view.structure}>
                  {view.structure}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

