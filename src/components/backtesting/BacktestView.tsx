"use client";

import React, { useState } from "react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { BacktestResult, Timeframe, AssetInfo } from "@/types/market";
import {
  FlaskConical,
  Play,
  RotateCcw,
  TrendingUp,
  Percent,
  ShieldCheck,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";

export function BacktestView() {
  const [selectedAsset, setSelectedAsset] = useState<string>("XAU/USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("15m");
  const [lookbackBars, setLookbackBars] = useState<number>(200);
  const [minConfluence, setMinConfluence] = useState<number>(68);
  const [riskReward, setRiskReward] = useState<number>(2.0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRunBacktest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedAsset,
          timeframe: selectedTimeframe,
          lookbackBars,
          minConfluenceScore: minConfluence,
          riskRewardRatio: riskReward,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      }
    } catch (err) {
      console.error("Backtest failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="terminal-glass rounded-lg p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <span>Walk-Forward Strategy Backtester</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                ZERO LOOKAHEAD BIAS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates quantitative multi-factor confluence model strictly using information available at bar close.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
        >
          {loading ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{loading ? "Simulating Walk-Forward..." : "Execute Simulation"}</span>
        </button>
      </div>

      {/* Parameter Control Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-lg bg-[#090e18] border border-white/5 font-mono text-xs">
        {/* Asset */}
        <div>
          <label className="text-[10px] uppercase text-slate-400 block mb-1 font-semibold">Instrument</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full bg-[#0d1424] text-white p-2 rounded border border-white/10 focus:outline-none text-xs"
          >
            {SUPPORTED_ASSETS.map((a) => (
              <option key={a.id} value={a.symbol}>
                {a.symbol} ({a.category})
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe */}
        <div>
          <label className="text-[10px] uppercase text-slate-400 block mb-1 font-semibold">Timeframe</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as Timeframe)}
            className="w-full bg-[#0d1424] text-white p-2 rounded border border-white/10 focus:outline-none text-xs uppercase"
          >
            {["1m", "5m", "15m", "30m", "1h", "4h", "1d"].map((tf) => (
              <option key={tf} value={tf}>
                {tf.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Lookback Bars */}
        <div>
          <div className="flex justify-between text-[10px] uppercase text-slate-400 mb-1 font-semibold">
            <span>Lookback:</span>
            <span className="text-sky-400">{lookbackBars} Bars</span>
          </div>
          <input
            type="range"
            min="100"
            max="300"
            step="20"
            value={lookbackBars}
            onChange={(e) => setLookbackBars(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Min Confluence */}
        <div>
          <div className="flex justify-between text-[10px] uppercase text-slate-400 mb-1 font-semibold">
            <span>Min Confluence:</span>
            <span className="text-sky-400">{minConfluence}/100</span>
          </div>
          <input
            type="range"
            min="55"
            max="80"
            step="1"
            value={minConfluence}
            onChange={(e) => setMinConfluence(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Risk / Reward */}
        <div>
          <div className="flex justify-between text-[10px] uppercase text-slate-400 mb-1 font-semibold">
            <span>Risk / Reward:</span>
            <span className="text-sky-400">1 : {riskReward.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="3.5"
            step="0.5"
            value={riskReward}
            onChange={(e) => setRiskReward(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Results Matrix */}
      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <div className="p-3 rounded-lg bg-[#0d1424] border border-white/10 font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {result.winRatePercent}%
              </div>
              <div className="text-[10px] text-slate-500">
                {result.winCount}W - {result.lossCount}L
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1424] border border-white/10 font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Profit Factor</div>
              <div className="text-xl font-bold text-sky-400 mt-1">
                {result.profitFactor}x
              </div>
              <div className="text-[10px] text-slate-500">Gross Win / Loss</div>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1424] border border-white/10 font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Sharpe Ratio</div>
              <div className="text-xl font-bold text-white mt-1">
                {result.sharpeRatio}
              </div>
              <div className="text-[10px] text-slate-500">Risk-Adjusted</div>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1424] border border-white/10 font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Max Drawdown</div>
              <div className="text-xl font-bold text-rose-400 mt-1">
                -{result.maxDrawdownPercent}%
              </div>
              <div className="text-[10px] text-slate-500">Peak-to-Trough</div>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1424] border border-white/10 font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Expectancy</div>
              <div className="text-xl font-bold text-emerald-300 mt-1">
                +{result.expectancyPips} pips
              </div>
              <div className="text-[10px] text-slate-500">Per Evaluated Trade</div>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1424] border border-white/10 font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Signals</div>
              <div className="text-xl font-bold text-white mt-1">
                {result.totalTrades}
              </div>
              <div className="text-[10px] text-slate-500">Walk-Forward Bars</div>
            </div>
          </div>

          {/* Trades Log Table */}
          <div className="terminal-glass rounded-lg border border-white/10 overflow-hidden font-mono">
            <div className="p-3 border-b border-white/10 bg-[#070c16] flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Simulated Walk-Forward Execution Log ({result.tradesList.length} Trades)
              </span>
              <span className="text-slate-400 text-[11px]">
                {result.periodStart} ── {result.periodEnd}
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase bg-black/40">
                    <th className="py-2 px-3">Entry Time</th>
                    <th className="py-2 px-3">Direction</th>
                    <th className="py-2 px-3">Entry Price</th>
                    <th className="py-2 px-3">Exit Price</th>
                    <th className="py-2 px-3">Return</th>
                    <th className="py-2 px-3">Pips</th>
                    <th className="py-2 px-3">Confluence</th>
                    <th className="py-2 px-3 text-right">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.tradesList.map((trade) => {
                    const isWin = trade.outcome === "win";
                    return (
                      <tr key={trade.id} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {new Date(trade.entryTime).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              trade.direction === "long"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {trade.direction}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-white font-bold">{trade.entryPrice}</td>
                        <td className="py-2 px-3 text-slate-300">{trade.exitPrice}</td>
                        <td className="py-2 px-3">
                          <span className={isWin ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {trade.returnPercent > 0 ? "+" : ""}
                            {trade.returnPercent}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          {trade.pips > 0 ? "+" : ""}
                          {trade.pips}
                        </td>
                        <td className="py-2 px-3 text-sky-400 font-bold">{trade.confluenceScore}</td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isWin
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {trade.outcome}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="terminal-glass rounded-lg p-12 text-center border border-white/10 space-y-3 font-mono">
          <FlaskConical className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300 uppercase">
            No Backtest Executed In Current Session
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Select an instrument, timeframe, and risk parameters above, then click "Execute Simulation" to test the confluence model without lookahead bias.
          </p>
        </div>
      )}
    </div>
  );
}

