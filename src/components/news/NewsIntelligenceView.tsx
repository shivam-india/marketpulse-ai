"use client";

import React, { useState, useEffect } from "react";
import { MarketNewsItem } from "@/types/market";
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  ShieldAlert,
  Search,
  Filter,
} from "lucide-react";

export function NewsIntelligenceView() {
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/news?limit=15");
        const json = await res.json();
        if (json.success && json.data) {
          setNews(json.data);
        }
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  const filteredNews = news.filter((item) => {
    if (filterSentiment !== "all" && item.sentiment.bias !== filterSentiment) return false;
    if (
      searchQuery &&
      !item.headline.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.summary.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="terminal-glass rounded-lg p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <span>Global Market News & Sentiment Engine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                LIVE FEED • FINNHUB & NEWSAPI
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                AI NLP PARSER
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates macroeconomic impact, currency sensitivity, and contextual positioning.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search news intelligence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1424] text-xs font-mono text-slate-200 pl-8 pr-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center space-x-2 p-2.5 rounded bg-[#090e18] border border-white/5 font-mono text-xs">
        <span className="text-slate-500 text-[10px] uppercase font-semibold mr-1">Sentiment Filter:</span>
        {["all", "bullish", "bearish", "neutral"].map((sent) => (
          <button
            key={sent}
            onClick={() => setFilterSentiment(sent)}
            className={`px-2.5 py-0.5 rounded capitalize transition-colors text-[11px] ${
              filterSentiment === sent
                ? "bg-sky-500 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {sent}
          </button>
        ))}
      </div>

      {/* News Feed Grid */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div className="terminal-glass rounded-lg p-12 border border-white/10 text-center font-mono space-y-2">
            <Newspaper className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm font-bold text-slate-300">Live data unavailable</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No live market headlines found matching the current search query or sentiment filter.
            </p>
          </div>
        ) : (
          filteredNews.map((item) => {
          const isBull = item.sentiment.bias === "bullish";
          const isBear = item.sentiment.bias === "bearish";

          return (
            <div
              key={item.id}
              className="terminal-glass rounded-lg p-4 border border-white/10 space-y-3 font-mono hover:border-white/20 transition-all"
            >
              {/* Meta & Headline */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isBull
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : isBear
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.sentiment.bias} IMPACT (SCORE: {item.sentiment.score > 0 ? "+" : ""}
                    {item.sentiment.score})
                  </span>

                  <span className="text-[11px] text-slate-400">{item.source}</span>
                </div>

                <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.publishedAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Headline */}
              <h3 className="text-sm font-bold text-white leading-snug">
                {item.headline}
              </h3>

              {/* Summary */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {item.summary}
              </p>

              {/* Impact Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2.5 rounded bg-black/40 border border-white/5 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    Expected Short-Term Market Impact:
                  </span>
                  <span className="text-slate-200">{item.expectedImpact.shortTerm}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    Positioning Context:
                  </span>
                  <span className="text-slate-200">{item.expectedImpact.context}</span>
                </div>
              </div>

              {/* Affected Tags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-500 uppercase">Affected Assets:</span>
                  {item.affectedAssets.map((asset) => (
                    <span
                      key={asset}
                      className="px-1.5 py-0.2 rounded bg-white/5 text-slate-300 font-bold border border-white/5"
                    >
                      {asset}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-500 uppercase">Currencies:</span>
                  {item.affectedCurrencies.map((curr) => (
                    <span
                      key={curr}
                      className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 font-bold"
                    >
                      {curr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}

