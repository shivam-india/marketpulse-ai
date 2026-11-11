"use client";

import React, { useState } from "react";
import { OrderFlowAnalysis, OrderFlowFootprintBar, AssetInfo } from "@/types/market";
import { BarChart3, AlertTriangle, ArrowUp, ArrowDown, Activity, Info } from "lucide-react";

interface OrderFlowPanelProps {
  orderFlow: OrderFlowAnalysis;
  footprintBars: OrderFlowFootprintBar[];
  asset: AssetInfo;
}

export function OrderFlowPanel({ orderFlow, footprintBars, asset }: OrderFlowPanelProps) {
  const [activeTab, setActiveTab] = useState<"footprint" | "delta" | "volume_profile">("footprint");

  if (!orderFlow.isAvailable) {
    return (
      <div className="terminal-glass rounded-lg p-5 border border-amber-500/20 bg-amber-500/[0.02] space-y-3 font-mono">
        <div className="flex items-center space-x-2 text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Order-flow data unavailable for this instrument.
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Order-flow data unavailable for this instrument ({asset.symbol}).
          Direct order-flow telemetry requires tick-level futures / ECN order-book depth connections (live streaming supported for crypto instruments via Binance Level 2 DOM).
        </p>
        <div className="p-3 rounded bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Data Architecture Status:</div>
          <div>• Tick delta stream: Offline for {asset.symbol} on current provider.</div>
          <div>• To view live Level 2 Aggregated Delta and Footprint, select BTC/USD, ETH/USD, or SOL/USD.</div>
        </div>
      </div>
    );
  }

  const { cumulativeDeltaSummary, volumeProfile, aggression } = orderFlow;
  const isAccumulating = cumulativeDeltaSummary.trend === "accumulating";

  return (
    <div className="terminal-glass rounded-lg p-4 space-y-4 border border-white/10">
      {/* Header and Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
            Order Flow & Volume Delta
          </h3>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/30">
            LIVE L2
          </span>
        </div>

        <div className="flex items-center space-x-1 font-mono text-[11px] bg-black/40 p-0.5 rounded border border-white/5">
          <button
            onClick={() => setActiveTab("footprint")}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeTab === "footprint" ? "bg-sky-500 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Footprint Grid
          </button>
          <button
            onClick={() => setActiveTab("delta")}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeTab === "delta" ? "bg-sky-500 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Cumulative Delta
          </button>
          <button
            onClick={() => setActiveTab("volume_profile")}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeTab === "volume_profile" ? "bg-sky-500 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Volume Profile
          </button>
        </div>
      </div>

      {/* Primary Delta & Aggression Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
        {/* Cumulative Delta */}
        <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] uppercase text-slate-400 font-semibold">
            Cumulative Volume Delta (CVD)
          </div>
          <div className="flex items-center space-x-1.5 my-1">
            {isAccumulating ? (
              <ArrowUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-rose-400" />
            )}
            <span
              className={`text-base font-bold ${
                isAccumulating ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {cumulativeDeltaSummary.periodDelta > 0 ? "+" : ""}
              {cumulativeDeltaSummary.periodDelta.toLocaleString()}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 capitalize">
            Trend: {cumulativeDeltaSummary.trend}
          </div>
        </div>

        {/* Aggression / Market Orders */}
        <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] uppercase text-slate-400 font-semibold">
            Aggressive Pressure
          </div>
          <div className="my-1 space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-emerald-400">{aggression.buyPressurePercent}% Buy</span>
              <span className="text-rose-400">{aggression.sellPressurePercent}% Sell</span>
            </div>
            <div className="h-1.5 w-full bg-rose-500/30 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${aggression.buyPressurePercent}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-400">
            {aggression.recentImbalanceSpike ? "⚠️ Delta Imbalance Spike" : "Order absorption normal"}
          </div>
        </div>

        {/* Point of Control (POC) */}
        <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="text-[10px] uppercase text-slate-400 font-semibold">
            Point of Control (POC)
          </div>
          <div className="text-base font-bold text-sky-400 my-1 font-mono">
            {volumeProfile.poc.toFixed(asset.decimals)}
          </div>
          <div className="text-[10px] text-slate-400">
            VAH: {volumeProfile.vah.toFixed(asset.decimals)} | VAL: {volumeProfile.val.toFixed(asset.decimals)}
          </div>
        </div>
      </div>

      {/* Tab 1: Footprint Grid View */}
      {activeTab === "footprint" && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span>Aggressive Market Bid x Ask Clusters</span>
            <span className="text-sky-400 font-semibold">
              Showing {footprintBars.length} Footprint Bars
            </span>
          </div>

          <div className="border border-white/5 rounded overflow-x-auto max-h-[220px]">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-white/[0.03] text-slate-400 border-b border-white/5 text-[10px] uppercase">
                <tr>
                  <th className="p-1.5">Price Level</th>
                  <th className="p-1.5 text-right text-rose-400">Bid (Agg. Sells)</th>
                  <th className="p-1.5 text-right text-emerald-400">Ask (Agg. Buys)</th>
                  <th className="p-1.5 text-right">Delta</th>
                  <th className="p-1.5 text-right">Imbalance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {footprintBars.length > 0 && footprintBars[0].priceLevels.map((lvl, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="p-1.5 font-bold text-slate-200">
                      {lvl.price.toFixed(asset.decimals)}
                    </td>
                    <td className="p-1.5 text-right text-rose-300 font-semibold">
                      {lvl.bidVolume.toLocaleString()}
                    </td>
                    <td className="p-1.5 text-right text-emerald-300 font-semibold">
                      {lvl.askVolume.toLocaleString()}
                    </td>
                    <td
                      className={`p-1.5 text-right font-bold ${
                        lvl.delta > 0
                          ? "text-emerald-400"
                          : lvl.delta < 0
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {lvl.delta > 0 ? "+" : ""}
                      {lvl.delta.toLocaleString()}
                    </td>
                    <td className="p-1.5 text-right">
                      {lvl.imbalanceBuy ? (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                          BUY IMB
                        </span>
                      ) : lvl.imbalanceSell ? (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                          SELL IMB
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Cumulative Delta View */}
      {activeTab === "delta" && (
        <div className="p-4 rounded bg-white/[0.02] border border-white/5 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-semibold">Cumulative Volume Delta Summary</span>
            <span className="text-[11px] text-slate-400">
              {cumulativeDeltaSummary.divergenceDetected
                ? "⚠️ Delta Divergence Detected"
                : "No delta divergence against price"}
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Cumulative volume delta measures the net buying and selling aggression transacting at market.
            When delta trends upward while price consolidates, it indicates institutional limit accumulation.
          </p>
          <div className="p-2.5 rounded bg-[#070b14] border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">Net Period Aggr. Delta:</span>
            <span className={`font-bold ${cumulativeDeltaSummary.periodDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {cumulativeDeltaSummary.periodDelta > 0 ? "+" : ""}{cumulativeDeltaSummary.periodDelta.toLocaleString()} contracts
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Volume Profile */}
      {activeTab === "volume_profile" && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>Value Area Distribution (70% Volume Band)</span>
            <span>Current POC: {volumeProfile.poc.toFixed(asset.decimals)}</span>
          </div>
          <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Value Area High (VAH):</span>
              <span className="font-bold text-white">{volumeProfile.vah.toFixed(asset.decimals)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sky-400 font-bold">Point of Control (POC):</span>
              <span className="font-bold text-sky-400">{volumeProfile.poc.toFixed(asset.decimals)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Value Area Low (VAL):</span>
              <span className="font-bold text-white">{volumeProfile.val.toFixed(asset.decimals)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
