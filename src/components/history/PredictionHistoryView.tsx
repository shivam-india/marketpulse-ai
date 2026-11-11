"use client";

import React, { useState } from "react";
import { INITIAL_PREDICTION_HISTORY } from "@/lib/storage/store";
import { HistoricalPredictionRecord } from "@/types/market";
import { History, CheckCircle2, XCircle, TrendingUp, HelpCircle, ShieldCheck } from "lucide-react";

export function PredictionHistoryView() {
  const [history, setHistory] = useState<HistoricalPredictionRecord[]>(INITIAL_PREDICTION_HISTORY);

  const totalEvaluated = history.filter((h) => h.actualOutcome).length;
  const successfulCount = history.filter((h) => h.actualOutcome === "success").length;
  const directionalAccuracy =
    totalEvaluated > 0 ? Number(((successfulCount / totalEvaluated) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="terminal-glass rounded-lg p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <span>AI Forecast Performance & Calibration History</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                SELF-EVALUATING MODEL
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              System tracks subsequent price movement after each horizon expiration to calibrate scenario confidence.
            </p>
          </div>
        </div>

        {/* Calibration Badge */}
        <div className="flex items-center space-x-3 p-2 rounded bg-black/40 border border-white/10">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Directional Accuracy</div>
            <div className="text-lg font-bold text-emerald-400">
              {directionalAccuracy}% <span className="text-xs text-slate-400 font-normal">({successfulCount}/{totalEvaluated})</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Tracked Forecasts</div>
            <div className="text-lg font-bold text-white">{history.length}</div>
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="terminal-glass rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#070c16] text-[10px] text-slate-400 uppercase">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Instrument</th>
                <th className="py-2.5 px-3">Timeframe</th>
                <th className="py-2.5 px-3">Predicted Bias</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Entry Price</th>
                <th className="py-2.5 px-3">Subsequent Price</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3">Core Thesis Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((record) => {
                const isSuccess = record.actualOutcome === "success";

                return (
                  <tr key={record.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(record.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3 px-3 font-bold text-white">
                      {record.assetSymbol}
                    </td>

                    <td className="py-3 px-3 uppercase text-slate-300">
                      {record.timeframe}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          record.predictedBias === "bullish"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {record.predictedBias}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-sky-400 font-bold">
                      {record.predictedConfidence}%
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {record.entryPrice}
                    </td>

                    <td className="py-3 px-3 font-bold text-white">
                      {record.evaluationPriceAfterHorizon || "Evaluating..."}
                    </td>

                    <td className="py-3 px-3">
                      {record.actualOutcome ? (
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isSuccess
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-400" />
                          )}
                          <span>{record.actualOutcome}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">PENDING HORIZON</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate" title={record.reasoningSnippet}>
                      {record.reasoningSnippet}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

