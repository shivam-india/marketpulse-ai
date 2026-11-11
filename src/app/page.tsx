"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { TickerBar } from "@/components/layout/TickerBar";
import { Sidebar, TerminalView } from "@/components/layout/Sidebar";
import { GlobalMarketOverview } from "@/components/dashboard/GlobalMarketOverview";
import { AssetAnalysisView } from "@/components/asset/AssetAnalysisView";
import { MarketScanner } from "@/components/scanner/MarketScanner";
import { EconomicCalendarView } from "@/components/calendar/EconomicCalendarView";
import { NewsIntelligenceView } from "@/components/news/NewsIntelligenceView";
import { BacktestView } from "@/components/backtesting/BacktestView";
import { PredictionHistoryView } from "@/components/history/PredictionHistoryView";
import { IntegrationsView } from "@/components/settings/IntegrationsView";
import { AdminView } from "@/components/admin/AdminView";
import { ChartVisionModal } from "@/components/vision/ChartVisionModal";
import { AlertsManager } from "@/components/alerts/AlertsManager";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { AssetInfo, EconomicEvent, MarketNewsItem } from "@/types/market";

export default function Home() {
  const [currentView, setCurrentView] = useState<TerminalView>("dashboard");
  const [activeAsset, setActiveAsset] = useState<AssetInfo>(
    SUPPORTED_ASSETS.find((a) => a.symbol === "XAU/USD") || SUPPORTED_ASSETS[0]
  );

  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  const [upcomingEvents, setUpcomingEvents] = useState<EconomicEvent[]>([]);
  const [topNews, setTopNews] = useState<MarketNewsItem[]>([]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [eventRes, newsRes] = await Promise.all([
          fetch("/api/calendar"),
          fetch("/api/news?limit=10"),
        ]);
        const eventJson = await eventRes.json();
        const newsJson = await newsRes.json();

        if (eventJson.data) setUpcomingEvents(eventJson.data);
        if (newsJson.data) setTopNews(newsJson.data);
      } catch (err) {
        console.error("Initial data fetch failed:", err);
      }
    }
    fetchInitialData();
  }, []);

  const handleSelectAsset = (asset: AssetInfo) => {
    setActiveAsset(asset);
    setCurrentView("asset_analysis");
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-[#f1f5f9] flex flex-col font-mono selection:bg-sky-500/30">
      {/* Institutional Top Navigation Header */}
      <Header
        activeAsset={activeAsset}
        onSelectAsset={handleSelectAsset}
        onOpenVisionModal={() => setIsVisionModalOpen(true)}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
      />

      {/* Real-time Ticker Ribbon */}
      <TickerBar
        activeSymbol={activeAsset.symbol}
        onSelectAsset={handleSelectAsset}
      />

      {/* Main Terminal Workspace Layout */}
      <div className="flex flex-1 relative">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => setCurrentView(view)}
        />

        {/* Dynamic Terminal Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1720px] mx-auto w-full">
          {currentView === "dashboard" && (
            <GlobalMarketOverview
              onSelectAsset={handleSelectAsset}
              upcomingEvents={upcomingEvents}
              topNews={topNews}
            />
          )}

          {currentView === "asset_analysis" && (
            <AssetAnalysisView
              asset={activeAsset}
              onOpenVisionModal={() => setIsVisionModalOpen(true)}
            />
          )}

          {currentView === "scanner" && (
            <MarketScanner onSelectAsset={handleSelectAsset} />
          )}

          {currentView === "calendar" && <EconomicCalendarView />}

          {currentView === "news" && <NewsIntelligenceView />}

          {currentView === "liquidity" && (
            <div className="space-y-4">
              <div className="terminal-glass rounded-lg p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Liquidity Intelligence Deep Dive: {activeAsset.symbol}
                  </h2>
                  <p className="text-xs text-slate-400 font-sans">
                    Resting stop liquidity, equal highs/lows, and volume depth profile.
                  </p>
                </div>
              </div>
              <AssetAnalysisView
                asset={activeAsset}
                onOpenVisionModal={() => setIsVisionModalOpen(true)}
              />
            </div>
          )}

          {currentView === "order_flow" && (
            <div className="space-y-4">
              <div className="terminal-glass rounded-lg p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Order Flow & Footprint Delta Matrix: {activeAsset.symbol}
                  </h2>
                  <p className="text-xs text-slate-400 font-sans">
                    Cumulative Volume Delta (CVD), absorption signals, and footprint clusters.
                  </p>
                </div>
              </div>
              <AssetAnalysisView
                asset={activeAsset}
                onOpenVisionModal={() => setIsVisionModalOpen(true)}
              />
            </div>
          )}

          {currentView === "backtesting" && <BacktestView />}

          {currentView === "history" && <PredictionHistoryView />}

          {currentView === "integrations" && <IntegrationsView />}

          {currentView === "admin" && <AdminView />}
        </main>
      </div>

      {/* Global Modals */}
      <ChartVisionModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        activeSymbol={activeAsset.symbol}
      />

      <AlertsManager
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        activeAsset={activeAsset}
      />
    </div>
  );
}

