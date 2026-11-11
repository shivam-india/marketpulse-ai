"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Bell,
  Clock,
  Compass,
  FileImage,
  Globe,
  Search,
  ShieldCheck,
  Sliders,
  TrendingUp,
} from "lucide-react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { getCurrentSessions } from "@/lib/analysis/session-engine";
import { AssetInfo } from "@/types/market";

interface HeaderProps {
  onSelectAsset: (asset: AssetInfo) => void;
  onOpenVisionModal: () => void;
  onOpenAlertsModal: () => void;
  activeAsset: AssetInfo;
}

export function Header({
  onSelectAsset,
  onOpenVisionModal,
  onOpenAlertsModal,
  activeAsset,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [sessionsInfo, setSessionsInfo] = useState(getCurrentSessions());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        `${now.toISOString().slice(11, 19)} UTC | ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} Local`
      );
      setSessionsInfo(getCurrentSessions(now));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredAssets = SUPPORTED_ASSETS.filter(
    (a) =>
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="border-b border-white/10 bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top micro-status bar */}
      <div className="flex items-center justify-between px-4 py-1 text-[11px] font-mono text-slate-400 border-b border-white/5 bg-[#06090e]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wider text-[10px]">ALL FEEDS LIVE</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">SESSIONS:</span>
            <span className={sessionsInfo.sessionDetails.tokyo.isOpen ? "text-emerald-400 font-medium" : "text-slate-500"}>
              TOKYO {sessionsInfo.sessionDetails.tokyo.isOpen ? "●" : "○"}
            </span>
            <span className={sessionsInfo.sessionDetails.london.isOpen ? "text-emerald-400 font-medium" : "text-slate-500"}>
              LONDON {sessionsInfo.sessionDetails.london.isOpen ? "●" : "○"}
            </span>
            <span className={sessionsInfo.sessionDetails.new_york.isOpen ? "text-emerald-400 font-medium" : "text-slate-500"}>
              NEW YORK {sessionsInfo.sessionDetails.new_york.isOpen ? "●" : "○"}
            </span>
            {sessionsInfo.isLondonNYOverlap && (
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30">
                LON/NY OVERLAP (PEAK LIQUIDITY)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{currentTime || "SYNCING UTC..."}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400/90 font-medium">RESEARCH PLATFORM • NOT FINANCIAL ADVICE</span>
        </div>
      </div>

      {/* Main Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center space-x-6">
          {/* Logo Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-sky-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/40">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-white text-base">
                  MarketPulse <span className="text-sky-400">AI</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-medium">
                  PRO v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                Probabilistic Financial Outlook & Confluence Engine
              </p>
            </div>
          </div>
        </div>

        {/* Global Asset Search */}
        <div className="relative w-80 max-w-sm hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol (e.g. XAU/USD, EUR/USD, BTC)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-[#0d1424] text-xs font-mono text-slate-200 pl-9 pr-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-sky-500/60 transition-colors"
            />
          </div>

          {/* Quick Search Dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute top-full mt-1.5 left-0 w-full bg-[#0d1424] border border-white/15 rounded-md shadow-2xl z-50 max-h-72 overflow-y-auto">
              <div className="p-1.5 text-[10px] uppercase font-mono text-slate-400 tracking-wider border-b border-white/5">
                Matched Instruments ({filteredAssets.length})
              </div>
              {filteredAssets.length === 0 ? (
                <div className="p-3 text-xs text-slate-400 text-center">No matching instrument found.</div>
              ) : (
                filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => {
                      onSelectAsset(asset);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div>
                      <div className="text-xs font-bold text-white font-mono">{asset.symbol}</div>
                      <div className="text-[11px] text-slate-400">{asset.name}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs text-white">{asset.currentPrice.toFixed(asset.decimals)}</div>
                      <div
                        className={`text-[10px] ${
                          asset.change24hPercent >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {asset.change24hPercent >= 0 ? "+" : ""}
                        {asset.change24hPercent}%
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Controls & User Meta */}
        <div className="flex items-center space-x-2.5">
          {/* Chart Vision Upload Button */}
          <button
            onClick={onOpenVisionModal}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors text-xs font-mono"
            title="Upload chart screenshot for computer vision AI structural analysis"
          >
            <FileImage className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Chart Vision</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={onOpenAlertsModal}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors relative"
            title="Manage Confluence & Price Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400"></span>
          </button>

          {/* Institutional User Badge */}
          <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/15 flex items-center justify-center font-mono font-bold text-xs text-sky-300">
              MP
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200">Terminal Lead</div>
              <div className="text-[10px] font-mono text-emerald-400">INSTITUTIONAL</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

