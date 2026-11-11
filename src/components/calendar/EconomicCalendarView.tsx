"use client";

import React, { useState, useEffect } from "react";
import { EconomicEvent, ImportanceLevel } from "@/types/market";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Flame,
  Filter,
  Globe,
  ChevronDown,
  Info,
} from "lucide-react";

export function EconomicCalendarView() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("all");
  const [selectedImportance, setSelectedImportance] = useState<string>("all");
  const [selectedEventModal, setSelectedEventModal] = useState<EconomicEvent | null>(null);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch("/api/calendar");
        const json = await res.json();
        if (json.success && json.data) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error("Failed to load economic calendar:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

  const currencies = ["all", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

  const filtered = events.filter((e) => {
    if (selectedCurrency !== "all" && e.currency !== selectedCurrency) return false;
    if (selectedImportance !== "all" && e.importance !== selectedImportance) return false;
    return true;
  });

  const getImportanceBadge = (importance: ImportanceLevel) => {
    switch (importance) {
      case "critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold";
      case "high":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold";
      case "medium":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      default:
        return "bg-slate-700/30 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="terminal-glass rounded-lg p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <span>Global Macroeconomic Calendar</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                LIVE FEED • FOREX FACTORY
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                HIGH VOLATILITY RADAR
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Tracks scheduled central-bank announcements, inflation reports, and macroeconomic releases.
            </p>
          </div>
        </div>

        {/* Currency Quick Tabs */}
        <div className="flex items-center space-x-1 font-mono text-xs bg-[#0c1220] p-1 rounded border border-white/5">
          {currencies.map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-2 py-0.5 rounded uppercase font-semibold transition-colors ${
                selectedCurrency === curr
                  ? "bg-sky-500 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#090e18] border border-white/5 font-mono text-xs">
        <div className="flex items-center space-x-1">
          <span className="text-slate-500 mr-2 uppercase text-[10px] font-semibold">Importance:</span>
          {["all", "critical", "high", "medium", "low"].map((imp) => (
            <button
              key={imp}
              onClick={() => setSelectedImportance(imp)}
              className={`px-2 py-0.5 rounded uppercase transition-colors text-[11px] ${
                selectedImportance === imp
                  ? "bg-white/15 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {imp}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400">
          Showing {filtered.length} scheduled macroeconomic releases
        </div>
      </div>

      {/* Events Table */}
      <div className="terminal-glass rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#070c16] text-[10px] text-slate-400 uppercase">
                <th className="py-2.5 px-3">Time & Date</th>
                <th className="py-2.5 px-3">Currency</th>
                <th className="py-2.5 px-3">Event Description</th>
                <th className="py-2.5 px-3">Importance</th>
                <th className="py-2.5 px-3">Forecast</th>
                <th className="py-2.5 px-3">Previous</th>
                <th className="py-2.5 px-3">Expected Volatility</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Calendar className="w-8 h-8 text-slate-500" />
                      <div className="text-sm font-bold text-slate-300">Live data unavailable</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No economic calendar releases found matching the selected currency or importance filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((event) => {
                const nowSec = Math.floor(Date.now() / 1000);
                const diffHours = Math.max(0, Math.round((event.timestamp - nowSec) / 3600));

                return (
                  <tr
                    key={event.id}
                    onClick={() => setSelectedEventModal(event)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{event.time}</div>
                      <div className="text-[10px] text-slate-400">{event.date}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-200 font-bold border border-white/10">
                        {event.currency}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-bold text-white group-hover:text-sky-300 transition-colors">
                        {event.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {event.country} • {event.macroSignificance}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase border ${getImportanceBadge(
                          event.importance
                        )}`}
                      >
                        {event.importance}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-sky-400">
                      {event.forecast || "-"}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      {event.previous || "-"}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          event.expectedVolatility === "extreme"
                            ? "bg-rose-500/20 text-rose-300"
                            : event.expectedVolatility === "high"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {event.expectedVolatility}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventModal(event);
                        }}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold"
                      >
                        View Impact
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b101c] border border-white/15 rounded-lg w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold uppercase">
                  {selectedEventModal.currency} Macro Event
                </span>
                <h3 className="text-sm font-bold text-white font-mono mt-1">
                  {selectedEventModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Macroeconomic Significance</div>
                <p className="text-slate-300 leading-relaxed">{selectedEventModal.macroSignificance}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded bg-white/5">
                  <div className="text-[10px] text-slate-400">Previous Value</div>
                  <div className="font-bold text-white text-sm">{selectedEventModal.previous || "-"}</div>
                </div>
                <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20">
                  <div className="text-[10px] text-sky-400">Consensus Forecast</div>
                  <div className="font-bold text-sky-300 text-sm">{selectedEventModal.forecast || "-"}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">
                  Primary Affected Instruments:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEventModal.affectedAssets.map((asset) => (
                    <span
                      key={asset}
                      className="px-2 py-0.5 rounded bg-white/10 text-slate-200 text-[11px] font-bold"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

