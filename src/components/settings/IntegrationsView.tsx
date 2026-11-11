"use client";

import React, { useState, useEffect } from "react";
import { ProviderStatus } from "@/lib/providers/types";
import {
  SlidersHorizontal,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Cpu,
  Globe,
  Database,
  ExternalLink,
} from "lucide-react";

export function IntegrationsView() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealth() {
      try {
        const res = await fetch("/api/health");
        const json = await res.json();
        if (json.providers) {
          setProviders(json.providers);
        }
      } catch (err) {
        console.error("Failed to load integrations health:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHealth();
  }, []);

  const integrationConfigs = [
    {
      envVar: "GEMINI_API_KEY",
      name: "Google Gemini 1.5 Pro / Flash API",
      provider: "Google AI Studio",
      category: "AI Reasoning & Multimodal Vision",
      description: "Powers real-time chart screenshot visual interpretation and deep macro reasoning.",
      link: "https://aistudio.google.com/",
    },
    {
      envVar: "OPENAI_API_KEY",
      name: "OpenAI GPT-4o API",
      provider: "OpenAI",
      category: "AI Reasoning",
      description: "Optional secondary model provider for ensemble market thesis generation.",
      link: "https://platform.openai.com/",
    },
    {
      envVar: "FINNHUB_API_KEY",
      name: "Finnhub Institutional Market API",
      provider: "Finnhub Stock & FX API",
      category: "Market Data & Quotes",
      description: "Direct real-time tick streaming for Forex, Commodities, and Indices.",
      link: "https://finnhub.io/",
    },
    {
      envVar: "MARKETAUX_API_KEY",
      name: "MarketAux Financial News API",
      provider: "MarketAux",
      category: "News Intelligence",
      description: "Real-time institutional newsfeed filtering with entity sentiment tagging.",
      link: "https://www.marketaux.com/",
    },
    {
      envVar: "ALPHA_VANTAGE_API_KEY",
      name: "Alpha Vantage Data Feed",
      provider: "Alpha Vantage",
      category: "Market Data & Indicators",
      description: "Historical tick and daily bars provider for walk-forward backtests.",
      link: "https://www.alphavantage.co/",
    },
    {
      envVar: "BINANCE_API_KEY",
      name: "Binance Spot & Futures Order Book L2/L3",
      provider: "Binance Developer API",
      category: "Order Flow & Liquidity Depth",
      description: "Direct depth of market (DOM), funding rate, and aggressive trade delta stream.",
      link: "https://binance.com/",
    },
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="terminal-glass rounded-lg p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <span>API Integrations & External Feeds</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                SERVER-SIDE SECURE
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Manage data provider connections. All keys are securely stored server-side in environment variables and never exposed to client JavaScript.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 p-2 rounded bg-black/40 border border-white/10">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>ZERO CLIENT SECRET LEAKAGE</span>
        </div>
      </div>

      {/* Active Provider Health Telemetry */}
      <div className="terminal-glass rounded-lg border border-white/10 p-4 space-y-3">
        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-2">
          <Database className="w-4 h-4 text-sky-400" />
          <span>Live Provider Health & Route Latency</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {providers.map((p) => {
            const isConn = p.status === "connected";

            return (
              <div
                key={p.name}
                className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-white">{p.name}</div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      isConn
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-sans">{p.notes}</div>

                <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                  <span>Category: {p.category}</span>
                  <span className="text-sky-400 font-bold">{p.latencyMs} ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Guide & Secure Environment Setup */}
      <div className="terminal-glass rounded-lg border border-white/10 p-4 space-y-3">
        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-2">
          <Key className="w-4 h-4 text-amber-400" />
          <span>Supported Environment Variables Configuration (.env.local)</span>
        </div>

        <div className="space-y-3">
          {integrationConfigs.map((cfg) => (
            <div
              key={cfg.envVar}
              className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1.5 text-xs hover:border-white/15 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-black/60 text-sky-400 font-bold text-[11px] border border-white/10">
                    {cfg.envVar}
                  </span>
                  <span className="text-white font-semibold">{cfg.name}</span>
                </div>

                <a
                  href={cfg.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:text-sky-300 text-[11px] flex items-center space-x-1"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-slate-400 text-xs font-sans">{cfg.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

