"use client";

import React from "react";
import { AIReasoningOutput, AssetInfo } from "@/types/market";
import { X, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  outlook: AIReasoningOutput;
  asset: AssetInfo;
}

export function WhyModal({ isOpen, onClose, outlook, asset }: WhyModalProps) {
  if (!isOpen) return null;

  const isBullish = outlook.overallBias === "bullish";
  const isBearish = outlook.overallBias === "bearish";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b101c] border border-white/15 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                Algorithmic Explainability & Evidence
              </h2>
              <p className="text-xs text-slate-400">
                Transparent breakdown of model reasoning for {asset.symbol} ({outlook.timeframe.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thesis Summary Card */}
        <div className="p-3.5 rounded bg-white/[0.03] border border-white/10 flex items-center justify-between font-mono text-xs">
          <div>
            <span className="text-slate-400">CURRENT MODEL BIAS: </span>
            <span
              className={`font-bold uppercase ${
                isBullish
                  ? "text-emerald-400"
                  : isBearish
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {outlook.overallBias} ({outlook.calibratedConfidence}%)
            </span>
          </div>
          <div className="text-slate-400">
            CONFLUENCE: <span className="text-sky-400 font-bold">{outlook.confluenceScore}/100</span>
          </div>
        </div>

        {/* Section 1: Supporting Evidence */}
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>PRIMARY SUPPORTING EVIDENCE (WHY {outlook.overallBias.toUpperCase()}?)</span>
          </div>
          <div className="space-y-2">
            {outlook.keyReasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-emerald-500/[0.05] border border-emerald-500/20 text-xs text-slate-200 flex items-start space-x-2.5"
              >
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Conflicting Signals */}
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>CONFLICTING SIGNALS & RISK FACTORS</span>
          </div>
          <div className="space-y-2">
            {outlook.conflictingSignals.map((signal, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-amber-500/[0.05] border border-amber-500/20 text-xs text-slate-200 flex items-start space-x-2.5"
              >
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠</span>
                <span className="leading-relaxed">{signal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Cross-Market Confirmation */}
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 font-mono uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>CROSS-MARKET CONFIRMATION</span>
          </div>
          <div className="space-y-2">
            {outlook.crossMarketConfirmation.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-sky-500/[0.04] border border-sky-500/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-sky-300 font-bold">{item.pair}</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 text-[10px] uppercase">
                    {item.currentBehavior} ({item.relationship})
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs text-slate-400 font-mono">
          <span>DATA FRESHNESS: ~{outlook.dataFreshness.priceAgeSeconds}s ago</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

