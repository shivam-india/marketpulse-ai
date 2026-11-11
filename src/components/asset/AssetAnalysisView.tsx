"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  AssetInfo,
  Timeframe,
  OHLCV,
  AIReasoningOutput,
  TechnicalAnalysisSummary,
  OrderFlowFootprintBar,
} from "@/types/market";
import { InteractiveChart } from "./InteractiveChart";
import { AIOutlookPanel } from "../ai/AIOutlookPanel";
import { ConfluenceGauge } from "../ai/ConfluenceGauge";
import { MarketStructureCard } from "./MarketStructureCard";
import { LiquidityMap } from "./LiquidityMap";
import { OrderFlowPanel } from "./OrderFlowPanel";
import { WhyModal } from "../ai/WhyModal";
import { analyzeMarketStructure } from "@/lib/analysis/market-structure";
import { computeOrderFlowAnalysis } from "@/lib/analysis/order-flow-engine";
import { identifyLiquidityPools } from "@/lib/analysis/liquidity-engine";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Droplets,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface AssetAnalysisViewProps {
  asset: AssetInfo;
  onOpenVisionModal: () => void;
}

export function AssetAnalysisView({ asset, onOpenVisionModal }: AssetAnalysisViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("15m");
  const [bars, setBars] = useState<OHLCV[]>([]);
  const [outlook, setOutlook] = useState<AIReasoningOutput | null>(null);
  const [realOrderFlowData, setRealOrderFlowData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"quick" | "deep" | "mtf">("deep");
  const [secondsAgo, setSecondsAgo] = useState(0);
  const lastFetchTimeRef = useRef<number>(Date.now());

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [candleRes, outlookRes, orderFlowRes] = await Promise.all([
        fetch(
          `/api/markets/candles?symbol=${encodeURIComponent(asset.symbol)}&timeframe=${timeframe}&count=120`
        ),
        fetch(
          `/api/ai/outlook?symbol=${encodeURIComponent(asset.symbol)}&timeframe=${timeframe}`
        ),
        fetch(
          `/api/orderflow?symbol=${encodeURIComponent(asset.symbol)}`
        ),
      ]);

      const [candleJson, outlookJson, orderFlowJson] = await Promise.all([
        candleRes.json(),
        outlookRes.json(),
        orderFlowRes.json(),
      ]);

      if (candleJson.bars) {
        setBars(candleJson.bars);
      }
      if (outlookJson.success && outlookJson.data) {
        setOutlook(outlookJson.data);
      }
      if (orderFlowJson.success && orderFlowJson.data) {
        setRealOrderFlowData(orderFlowJson.data);
      }

      lastFetchTimeRef.current = Date.now();
      setSecondsAgo(0);
    } catch (err) {
      console.error("Failed to load asset analysis:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Initial load and on change of symbol / timeframe
  useEffect(() => {
    loadData();
  }, [asset.symbol, timeframe]);

  // Seconds ago live counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastFetchTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Background polling every 10 seconds for real-time updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadData(true);
    }, 10000);
    return () => clearInterval(pollInterval);
  }, [asset.symbol, timeframe]);

  const isUp = asset.change24hPercent >= 0;

  // Compute local structure for child components
  const tech = bars.length > 0 ? analyzeMarketStructure(bars, timeframe) : null;
  const { analysis: fallbackOrderFlow, footprintBars: fallbackFootprint } =
    bars.length > 0
      ? computeOrderFlowAnalysis(bars, asset)
      : {
          analysis: {
            isAvailable: false,
            sourceNote: "Order-flow data unavailable for this instrument.",
            cumulativeDeltaSummary: { periodDelta: 0, trend: "neutral" as const, divergenceDetected: false },
            volumeProfile: { poc: asset.currentPrice, vah: asset.currentPrice, val: asset.currentPrice, highVolumeNodes: [], lowVolumeNodes: [] },
            aggression: { buyPressurePercent: 50, sellPressurePercent: 50, recentImbalanceSpike: false },
          },
          footprintBars: [],
        };

  const orderFlowToUse = realOrderFlowData?.orderFlow || fallbackOrderFlow;
  const footprintBarsToUse = realOrderFlowData?.footprintBars?.length
    ? realOrderFlowData.footprintBars
    : fallbackFootprint;

  const pools =
    bars.length > 0 && tech
      ? identifyLiquidityPools(bars, tech.marketStructure.points, asset.currentPrice, asset.pipSize)
      : [];

  const isFresh = secondsAgo < 15;

  return (
    <div className="space-y-4 font-mono">
      {/* Asset Header Bar */}
      <div className="terminal-glass rounded-lg p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {asset.symbol}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase font-semibold">
                {asset.category}
              </span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                {asset.name}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">
                Source: {asset.dataSource}
              </span>
              <span>•</span>
              <span>Spread: {asset.spread ?? "N/A"} pips</span>
              <span>•</span>
              {isFresh ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>LIVE • Updated {secondsAgo}s ago</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>STALE DATA ({secondsAgo}s)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Price & Change Badge */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white tracking-tight">
              {asset.currentPrice.toFixed(asset.decimals)}
            </div>
            <div
              className={`text-xs font-bold flex items-center justify-end ${
                isUp ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {isUp ? "+" : ""}
              {asset.change24h.toFixed(asset.decimals)} ({isUp ? "+" : ""}
              {asset.change24hPercent}%)
            </div>
          </div>

          {/* Analysis Mode Selector */}
          <div className="hidden lg:flex items-center bg-black/40 p-1 rounded border border-white/5 text-xs">
            {(["quick", "deep", "mtf"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAnalysisMode(m)}
                className={`px-2.5 py-1 rounded capitalize transition-all font-semibold ${
                  analysisMode === m
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "quick" ? "Quick" : m === "deep" ? "Deep AI" : "Multi-TF"}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadData(false)}
            className="p-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            title="Refresh Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Candlestick Chart */}
      <InteractiveChart
        asset={asset}
        timeframe={timeframe}
        bars={bars}
        supportLevels={tech?.marketStructure.supportLevels}
        resistanceLevels={tech?.marketStructure.resistanceLevels}
        onTimeframeChange={(tf) => setTimeframe(tf)}
        onRefresh={() => loadData(false)}
      />

      {/* Main AI Market Outlook Panel */}
      {outlook && (
        <AIOutlookPanel
          outlook={outlook}
          asset={asset}
          onOpenWhyModal={() => setIsWhyModalOpen(true)}
        />
      )}

      {/* Multi-Timeframe Confluence Gauge */}
      {outlook && <ConfluenceGauge outlook={outlook} />}

      {/* Market Structure Engine Details */}
      {tech && <MarketStructureCard tech={tech} asset={asset} />}

      {/* Liquidity Map & Order Flow Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiquidityMap
          pools={pools}
          asset={asset}
          realLiquidity={realOrderFlowData?.liquidity}
        />
        <OrderFlowPanel
          orderFlow={orderFlowToUse}
          footprintBars={footprintBarsToUse}
          asset={asset}
        />
      </div>

      {/* Explainable "Why?" Modal */}
      {outlook && (
        <WhyModal
          isOpen={isWhyModalOpen}
          onClose={() => setIsWhyModalOpen(false)}
          outlook={outlook}
          asset={asset}
        />
      )}
    </div>
  );
}
