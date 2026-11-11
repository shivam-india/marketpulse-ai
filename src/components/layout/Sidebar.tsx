"use client";

import React from "react";
import {
  LayoutDashboard,
  LineChart,
  Radar,
  Calendar,
  Newspaper,
  Layers,
  BarChart3,
  History,
  FlaskConical,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

export type TerminalView =
  | "dashboard"
  | "asset_analysis"
  | "scanner"
  | "calendar"
  | "news"
  | "liquidity"
  | "order_flow"
  | "backtesting"
  | "history"
  | "integrations"
  | "admin";

interface SidebarProps {
  currentView: TerminalView;
  onSelectView: (view: TerminalView) => void;
}

export function Sidebar({ currentView, onSelectView }: SidebarProps) {
  const navItems: { id: TerminalView; label: string; icon: any; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "asset_analysis", label: "AI Analysis", icon: LineChart, badge: "CORE" },
    { id: "scanner", label: "Market Scanner", icon: Radar },
    { id: "calendar", label: "Economic Calendar", icon: Calendar, badge: "LIVE" },
    { id: "news", label: "News Intelligence", icon: Newspaper },
    { id: "liquidity", label: "Liquidity Map", icon: Layers },
    { id: "order_flow", label: "Order Flow", icon: BarChart3 },
    { id: "backtesting", label: "Backtesting", icon: FlaskConical },
    { id: "history", label: "Forecast History", icon: History },
    { id: "integrations", label: "Integrations", icon: SlidersHorizontal },
    { id: "admin", label: "Admin Console", icon: ShieldAlert },
  ];

  return (
    <aside className="w-56 shrink-0 bg-[#070b12] border-r border-white/5 flex flex-col justify-between py-3 h-[calc(100vh-73px)] sticky top-[73px] select-none">
      <div className="space-y-4">
        <div className="px-3">
          <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold px-2 mb-1.5">
            PLATFORM MODULES
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all ${
                    isActive
                      ? "bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        item.badge === "CORE"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Terminal Telemetry Footer in Sidebar */}
      <div className="px-3">
        <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 font-mono text-[10px] space-y-1 text-slate-400">
          <div className="flex justify-between items-center text-slate-300 font-medium">
            <span>REASONING CORE</span>
            <span className="text-emerald-400">ACTIVE</span>
          </div>
          <div className="flex justify-between">
            <span>CALIBRATION</span>
            <span className="text-slate-200">BAYESIAN MTF</span>
          </div>
          <div className="flex justify-between">
            <span>LATENCY</span>
            <span className="text-slate-200">18 ms</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

