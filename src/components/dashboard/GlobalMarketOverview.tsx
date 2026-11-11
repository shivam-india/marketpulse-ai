"use client";

import React from "react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { AssetInfo, EconomicEvent, MarketNewsItem } from "@/types/market";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Compass,
  Flame,
  Globe,
  Layers,
  Newspaper,
  Radar,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

interface GlobalMarketOverviewProps {
  onSelectAsset: (asset: AssetInfo) => void;
  upcomingEvents: EconomicEvent[];
  topNews: MarketNewsItem[];
}

export function GlobalMarketOverview({
  onSelectAsset,
  upcomingEvents,
  topNews,
}: GlobalMarketOverviewProps) {
  const [liveAssets, setLiveAssets] = React.useState<AssetInfo[]>(SUPPORTED_ASSETS);

  React.useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch("/api/markets/quotes");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setLiveAssets(json.data);
        }
      } catch (err) {
        console.warn("Failed to fetch live quotes for overview:", err);
      }
    }
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 10000);
    return () => clearInterval(interval);
  }, []);

  // Highlighting key categories
  const indices = liveAssets.filter((a) => a.category === "index").slice(0, 4);
  const forex = liveAssets.filter((a) => a.category === "forex").slice(0, 4);
  const commodities = liveAssets.filter((a) => a.category === "commodity").slice(0, 3);
  const crypto = liveAssets.filter((a) => a.category === "crypto").slice(0, 3);

  // High confluence watchlist items
  const aiWatchlist = [
    {
      asset: liveAssets.find((a) => a.symbol === "XAU/USD") || SUPPORTED_ASSETS[0],
      bias: "BULLISH",
      confidence: 68,
      confluenceScore: 82,
      catalyst: "Holding higher lows; DXY softening at resistance",
    },
    {
      asset: liveAssets.find((a) => a.symbol === "BTC/USD") || SUPPORTED_ASSETS[0],
      bias: "BULLISH",
      confidence: 74,
      confluenceScore: 86,
      catalyst: "Institutional ETF net inflows + NQ high-beta tech alignment",
    },
    {
      asset: liveAssets.find((a) => a.symbol === "EUR/USD") || SUPPORTED_ASSETS[0],
      bias: "BEARISH",
      confidence: 71,
      confluenceScore: 76,
      catalyst: "Eurozone growth drag; transatlantic rate spread widening",
    },
    {
      asset: liveAssets.find((a) => a.symbol === "WTI Crude") || SUPPORTED_ASSETS[0],
      bias: "NEUTRAL",
      confidence: 54,
      confluenceScore: 54,
      catalyst: "OPEC+ cuts balanced by seasonal demand softness",
    },
  ];

  return (
    <div className="space-y-5 font-mono">
      {/* Global Regime & Macro Status Banner */}
      <div className="terminal-glass rounded-lg p-4 border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>Global Macro Environment & Regime Radar</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  RISK-ON EQUITIES / COMMODITY DIVERGENCE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Cross-asset synthesis of sovereign yields, currency differentials, index momentum, and central-bank policy expectations.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Macro Risk Appetite</div>
              <div className="text-sm font-bold text-sky-400">CONSTRUCTIVE (68/100)</div>
            </div>
          </div>
        </div>

        {/* Macro Gauge Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-slate-400">DXY DOLLAR INDEX</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">104.72 (-0.24%)</div>
            <div className="text-[10px] text-emerald-400">Softening Near Resistance</div>
          </div>

          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-slate-400">US 10Y BENCHMARK YIELD</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">4.38% (-4 bps)</div>
            <div className="text-[10px] text-sky-400">Rate Compression Window</div>
          </div>

          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-slate-400">CBOE VIX VOLATILITY</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">14.82 (-3.4%)</div>
            <div className="text-[10px] text-slate-400">Low Hedging Demand</div>
          </div>

          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-slate-400">GLOBAL SESSION OVERLAP</div>
            <div className="text-sm font-bold text-sky-300 mt-0.5">PEAK LIQUIDITY</div>
            <div className="text-[10px] text-slate-400">London & New York Active</div>
          </div>
        </div>
      </div>

      {/* AI High-Confluence Watchlist Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>AI Probabilistic Watchlist & Confluence Radar</span>
          </div>
          <span className="text-[10px] text-slate-400">Multi-factor model highest-alignment assets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {aiWatchlist.map((item) => {
            const isBull = item.bias === "BULLISH";
            const isBear = item.bias === "BEARISH";

            return (
              <div
                key={item.asset.id}
                onClick={() => onSelectAsset(item.asset)}
                className="terminal-glass rounded-lg p-3.5 border border-white/10 hover:border-sky-500/40 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {item.asset.symbol}
                    </span>
                    <div className="text-[10px] text-slate-400">{item.asset.name}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isBull
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : isBear
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.bias}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base font-bold text-white font-mono">
                    {item.asset.currentPrice.toFixed(item.asset.decimals)}
                  </span>
                  <span className="text-xs font-bold text-sky-400">
                    Confluence: {item.confluenceScore}/100
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-2 font-sans pt-1 border-t border-white/5">
                  {item.catalyst}
                </div>

                <div className="text-[10px] text-sky-400 font-bold text-right pt-1 flex items-center justify-end space-x-1">
                  <span>Open Deep Outlook</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset Class Overview Grids: Indices, Forex, Commodities, Crypto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Indices */}
        <div className="terminal-glass rounded-lg p-4 border border-white/10 space-y-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Major Global Equity Indices
            </span>
            <span className="text-[10px] text-slate-400">Cash & Futures Benchmarks</span>
          </div>
          <div className="space-y-1.5">
            {indices.map((asset) => {
              const isUp = asset.change24hPercent >= 0;
              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="flex items-center justify-between p-2 rounded bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{asset.symbol}</span>
                    <span className="text-slate-400 text-[11px] ml-2">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">
                      {asset.currentPrice.toFixed(asset.decimals)}
                    </span>
                    <span
                      className={`ml-2 font-bold ${
                        isUp ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isUp ? "+" : ""}
                      {asset.change24hPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forex Majors */}
        <div className="terminal-glass rounded-lg p-4 border border-white/10 space-y-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              G10 Currencies & Interbank FX
            </span>
            <span className="text-[10px] text-slate-400">Institutional ECN Feed</span>
          </div>
          <div className="space-y-1.5">
            {forex.map((asset) => {
              const isUp = asset.change24hPercent >= 0;
              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="flex items-center justify-between p-2 rounded bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{asset.symbol}</span>
                    <span className="text-slate-400 text-[11px] ml-2">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">
                      {asset.currentPrice.toFixed(asset.decimals)}
                    </span>
                    <span
                      className={`ml-2 font-bold ${
                        isUp ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isUp ? "+" : ""}
                      {asset.change24hPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Commodities & Crypto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Commodities */}
        <div className="terminal-glass rounded-lg p-4 border border-white/10 space-y-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Commodities & Precious Metals
            </span>
            <span className="text-[10px] text-slate-400">COMEX / NYMEX Benchmarks</span>
          </div>
          <div className="space-y-1.5">
            {commodities.map((asset) => {
              const isUp = asset.change24hPercent >= 0;
              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="flex items-center justify-between p-2 rounded bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{asset.symbol}</span>
                    <span className="text-slate-400 text-[11px] ml-2">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">
                      {asset.currentPrice.toFixed(asset.decimals)}
                    </span>
                    <span
                      className={`ml-2 font-bold ${
                        isUp ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isUp ? "+" : ""}
                      {asset.change24hPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crypto */}
        <div className="terminal-glass rounded-lg p-4 border border-white/10 space-y-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Digital Assets & Perpetual Swaps
            </span>
            <span className="text-[10px] text-slate-400">Spot & Perpetual Depth</span>
          </div>
          <div className="space-y-1.5">
            {crypto.map((asset) => {
              const isUp = asset.change24hPercent >= 0;
              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="flex items-center justify-between p-2 rounded bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{asset.symbol}</span>
                    <span className="text-slate-400 text-[11px] ml-2">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">
                      {asset.currentPrice.toFixed(asset.decimals)}
                    </span>
                    <span
                      className={`ml-2 font-bold ${
                        isUp ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isUp ? "+" : ""}
                      {asset.change24hPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Live Feeds: Macro Event Countdown + Wire Headlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming High-Impact Macro Releases */}
        <div className="terminal-glass rounded-lg p-4 border border-white/10 space-y-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Impending High-Impact Releases
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Countdown</span>
          </div>

          <div className="space-y-2">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="p-2.5 rounded bg-white/[0.02] border border-white/5 space-y-1 text-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-sky-300 text-[10px]">
                      {event.currency}
                    </span>
                    <span>{event.title}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold">{event.time}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Forecast: <strong className="text-slate-200">{event.forecast || "-"}</strong> |
                  Previous: <strong className="text-slate-200">{event.previous || "-"}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wire Headlines */}
        <div className="terminal-glass rounded-lg p-4 border border-white/10 space-y-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <Newspaper className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Institutional Macro Wire
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Real-Time</span>
          </div>

          <div className="space-y-2">
            {topNews.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded bg-white/[0.02] border border-white/5 space-y-1 text-xs"
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-sky-400 font-semibold">{item.source}</span>
                  <span className="text-slate-500">
                    {new Date(item.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="font-bold text-white leading-tight font-sans text-xs">
                  {item.headline}
                </div>
                <div className="text-[10px] text-slate-400">
                  Impact: <span className="text-emerald-400 uppercase font-bold">{item.sentiment.bias}</span> on {item.affectedAssets.slice(0, 3).join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

