"use client";

import React, { useState } from "react";
import { AIReasoningOutput, AssetInfo } from "@/types/market";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  HelpCircle,
  Info,
  Layers,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface AIOutlookPanelProps {
  outlook: AIReasoningOutput;
  asset: AssetInfo;
  onOpenWhyModal: () => void;
}

export function AIOutlookPanel({ outlook, asset, onOpenWhyModal }: AIOutlookPanelProps) {
  const isBullish = outlook.overallBias === "bullish";
  const isBearish = outlook.overallBias === "bearish";

  const biasColor = isBullish
    ? "text-emerald-400"
    : isBearish
    ? "text-rose-400"
    : "text-amber-400";

  const biasBg = isBullish
    ? "bg-emerald-500/10 border-emerald-500/30"
    : isBearish
    ? "bg-rose-500/10 border-rose-500/30"
    : "bg-amber-500/10 border-amber-500/30";

  return (
    <div className="terminal-glass rounded-lg p-4 space-y-4 border border-white/10">
      {/* Top Outlook Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <span>AI Market Outlook</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-normal">
                {outlook.timeframe.toUpperCase()} TIMEFRAME
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Bayesian multi-factor confluence assessment
            </p>
          </div>
        </div>

        {/* Why Button - Institutional Transparency */}
        <button
          onClick={onOpenWhyModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-mono font-medium transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>Explain "Why?"</span>
        </button>
      </div>

      {/* Primary Outlook Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Bias Card */}
        <div className={`p-3 rounded-md border ${biasBg} flex flex-col justify-between`}>
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Market Bias
          </div>
          <div className="flex items-center space-x-2 my-1">
            {isBullish ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : isBearish ? (
              <TrendingDown className="w-5 h-5 text-rose-400" />
            ) : (
              <div className="w-4 h-1 bg-amber-400 rounded-full" />
            )}
            <span className={`text-xl font-bold uppercase tracking-tight font-mono ${biasColor}`}>
              {outlook.overallBias}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {outlook.scenarios.baseCase.direction.toUpperCase()} SCENARIO LEADING
          </div>
        </div>

        {/* Calibrated Confidence */}
        <div className="p-3 rounded-md border border-white/10 bg-[#0d1424] flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400 font-semibold">
            <span>Model Confidence</span>
            <span className="text-sky-400 font-bold">{outlook.calibratedConfidence}%</span>
          </div>
          <div className="my-2">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isBullish
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                    : isBearish
                    ? "bg-gradient-to-r from-rose-600 to-rose-400"
                    : "bg-gradient-to-r from-amber-600 to-amber-400"
                }`}
                style={{ width: `${outlook.calibratedConfidence}%` }}
              />
            </div>
          </div>
          <div className="text-[9px] text-slate-400 font-mono">
            Probabilistic likelihood (not a guarantee)
          </div>
        </div>

        {/* Confluence Score */}
        <div className="p-3 rounded-md border border-white/10 bg-[#0d1424] flex flex-col justify-between">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
            Confluence Score
          </div>
          <div className="text-xl font-bold font-mono text-white my-1">
            {outlook.confluenceScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {outlook.confluenceScore >= 70 ? "HIGH CONFLUENCE" : "MODERATE ALIGNMENT"}
          </div>
        </div>

        {/* Market Regime */}
        <div className="p-3 rounded-md border border-white/10 bg-[#0d1424] flex flex-col justify-between">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
            Detected Regime
          </div>
          <div className="text-xs font-bold text-sky-300 uppercase tracking-tight font-mono my-1">
            {outlook.marketRegime.replace(/_/g, " ")}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Adaptive strategy active
          </div>
        </div>
      </div>

      {/* Expected Base Scenario */}
      <div className="p-3 rounded-md border border-white/10 bg-[#0a0f1d] space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-white font-mono">
          <span className="flex items-center space-x-1.5 text-sky-400">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>BASE CASE EXPECTATION ({outlook.scenarios.baseCase.probability}%)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Target Area: <strong className="text-slate-200">{outlook.scenarios.baseCase.targetArea}</strong>
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {outlook.scenarios.baseCase.title}. Price action is respecting higher-low intraday structure,
          with liquidity pools positioned overhead. As long as key support holds, momentum favors continued
          expansion into resistance.
        </p>

        {/* Key Reasons Bullets */}
        <div className="pt-2 border-t border-white/5 space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
            Key Supporting Reasons:
          </div>
          {outlook.keyReasons.slice(0, 3).map((reason, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Scenario & Invalidation Conditions (Always presented!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Alternative Scenario */}
        <div className="p-3 rounded-md border border-white/10 bg-[#0c1220] space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>ALTERNATIVE SCENARIO ({outlook.scenarios.alternative.probability}%)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {outlook.scenarios.alternative.title}. Target: {outlook.scenarios.alternative.targetArea}
          </p>
          <div className="text-[11px] text-slate-400">
            Risk Trigger: {outlook.scenarios.alternative.invalidationTrigger}
          </div>
        </div>

        {/* Invalidation Condition */}
        <div className="p-3 rounded-md border border-rose-500/20 bg-rose-500/[0.04] space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-400 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>THESIS INVALIDATION LEVEL</span>
          </div>
          <div className="text-sm font-bold font-mono text-white">
            {outlook.keyLevels.thesisInvalidation.toFixed(asset.decimals)}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {outlook.invalidationConditions[0]}
          </p>
        </div>
      </div>

      {/* Key Institutional Levels Grid */}
      <div className="border border-white/10 rounded-md p-3 bg-[#080d1a]">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-2">
          Key Institutional Price Levels
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono">
          <div className="p-2 rounded bg-white/5 border border-white/5">
            <div className="text-[9px] text-rose-400 uppercase">Major Res</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {outlook.keyLevels.majorResistance.toFixed(asset.decimals)}
            </div>
          </div>
          <div className="p-2 rounded bg-white/5 border border-white/5">
            <div className="text-[9px] text-rose-300 uppercase">Minor Res</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {outlook.keyLevels.minorResistance.toFixed(asset.decimals)}
            </div>
          </div>
          <div className="p-2 rounded bg-white/5 border border-white/5">
            <div className="text-[9px] text-sky-400 uppercase">Mid Pivot</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {outlook.keyLevels.currentPivot.toFixed(asset.decimals)}
            </div>
          </div>
          <div className="p-2 rounded bg-white/5 border border-white/5">
            <div className="text-[9px] text-emerald-300 uppercase">Minor Sup</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {outlook.keyLevels.minorSupport.toFixed(asset.decimals)}
            </div>
          </div>
          <div className="p-2 rounded bg-white/5 border border-white/5">
            <div className="text-[9px] text-emerald-400 uppercase">Major Sup</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {outlook.keyLevels.majorSupport.toFixed(asset.decimals)}
            </div>
          </div>
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
            <div className="text-[9px] text-amber-400 uppercase">Liquidity Target</div>
            <div className="text-xs font-bold text-amber-300 mt-0.5">
              {outlook.keyLevels.liquidityTarget.toFixed(asset.decimals)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

