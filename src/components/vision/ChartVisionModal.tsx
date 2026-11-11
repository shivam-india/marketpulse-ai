"use client";

import React, { useState, useRef } from "react";
import { ChartVisionDetection } from "@/types/market";
import {
  FileImage,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  ShieldAlert,
} from "lucide-react";

interface ChartVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol: string;
}

export function ChartVisionModal({
  isOpen,
  onClose,
  activeSymbol,
}: ChartVisionModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<ChartVisionDetection | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setVisionResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeChart = async () => {
    if (!imagePreview) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePreview,
          assetSymbol: activeSymbol,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setVisionResult(json.data);
      }
    } catch (err) {
      console.error("Vision analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b101c] border border-white/15 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 font-mono">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>Multimodal AI Chart Vision Parser</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">
                  {activeSymbol}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Upload any trading chart screenshot to extract market structure, imbalances, and candlestick patterns.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Dropzone */}
        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/15 hover:border-sky-500/50 rounded-lg p-8 text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03] space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Click or drag chart screenshot here</div>
              <div className="text-xs text-slate-400 mt-1">
                PNG, JPG, or WEBP (TradingView, MT4/5, or Bloomberg Terminal screenshots)
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/60 max-h-64 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Uploaded chart"
                className="max-h-64 object-contain w-full"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setVisionResult(null);
                }}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-black/80 hover:bg-black text-rose-400 text-xs font-bold border border-rose-500/30"
              >
                Change Image
              </button>
            </div>

            {!visionResult && (
              <div className="flex justify-end">
                <button
                  onClick={handleAnalyzeChart}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <RotateCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{loading ? "Parsing Multimodal Features..." : "Analyze Chart Screenshot"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vision Analysis Results */}
        {visionResult && (
          <div className="space-y-4 pt-3 border-t border-white/10">
            {/* Top Detection Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Trend Detected</div>
                <div className="text-sm font-bold text-emerald-400 uppercase mt-0.5">
                  {visionResult.trendDetected}
                </div>
              </div>

              <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Vision Confidence</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">
                  {visionResult.confidenceScore}%
                </div>
              </div>

              <div className="p-2.5 rounded bg-white/[0.03] border border-white/5 col-span-2">
                <div className="text-[10px] text-slate-400 uppercase">Structural Break</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">
                  {visionResult.structureBreak || "No Break Detected"}
                </div>
              </div>
            </div>

            {/* S/R & Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">
                  Detected Support & Resistance Zones:
                </div>
                {visionResult.supportZones.map((s, idx) => (
                  <div key={idx} className="text-emerald-400">
                    • Support ~{s.priceApprox}: <span className="text-slate-300 font-normal">{s.description}</span>
                  </div>
                ))}
                {visionResult.resistanceZones.map((r, idx) => (
                  <div key={idx} className="text-rose-400">
                    • Resistance ~{r.priceApprox}: <span className="text-slate-300 font-normal">{r.description}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">
                  Chart Patterns & Candlesticks:
                </div>
                {visionResult.patternsIdentified.map((p, idx) => (
                  <div key={idx} className="text-sky-300">
                    • {p}
                  </div>
                ))}
                {visionResult.candlestickObservations.map((c, idx) => (
                  <div key={idx} className="text-slate-300">
                    • {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Fair Value Gaps & Liquidity Imbalances */}
            <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">
                Imbalance / Liquidity Imbalances Identified:
              </div>
              {visionResult.liquidityImbalances.map((imb, idx) => (
                <div key={idx} className="text-amber-300">
                  • {imb}
                </div>
              ))}
            </div>

            {/* Honest Limitations Notice */}
            <div className="p-2.5 rounded bg-amber-500/[0.05] border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Model Transparency Note:</strong> {visionResult.honestLimitationsNotice}
              </span>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

