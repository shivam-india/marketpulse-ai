# MarketPulse AI ⚡
### Institutional Global Financial Market Analysis & Probabilistic Outlook Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat)](LICENSE)

> **IMPORTANT INSTITUTIONAL RESEARCH DISCLAIMER:**  
> **MarketPulse AI** is an advanced analytical and quantitative research intelligence platform. It is **NOT** a guaranteed prediction system or financial advice platform. Never treat any market outlook as certain. Every scenario presents explicit model confidence, mathematical Bayesian confluence breakdown, supporting structural evidence, honest conflicting counter-signals, and decisive price-level invalidation conditions.

---

## 🏛️ System Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │            LIVE MARKET DATA PROVIDER LAYER             │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
      ┌───────────────────────┬──────────────┴───────────────┬────────────────────────┐
      ▼                       ▼                              ▼                        ▼
[ Polygon.io ]          [ Binance L2 ]                 [ Forex Factory ]      [ Finnhub & NewsAPI ]
  • Interbank FX          • Live L2 Depth of Market      • Sovereign Calendar   • Real-Time Headlines
  • Spot Gold (XAU/USD)   • Aggregated Trade Flow        • Actual vs Consensus  • Entity Sentiment
  • Spot Silver (XAG/USD) • Cumulative Volume Delta CVD  • Expected Volatility  • Currency Impact
  • 15M/1H/1D Candles     • Volume Footprint & POC       • Time-to-Release      • Macro Bias
      │                       │                              │                        │
      └───────────────────────┼──────────────────────────────┴────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────────────────────────┐
        │            QUANTITATIVE & STRUCTURAL ENGINES               │
        ├────────────────────────────────────────────────────────────┤
        │ • Technical Indicators (EMA 20/50/200, Wilder RSI, ATR)    │
        │ • Market Structure (Pivots, HH/HL/LH/LL, BOS, CHoCH)       │
        │ • Liquidity Intelligence (DOM Book, Equal Highs/Lows)      │
        │ • Multi-Timeframe Bayesian Confluence (1M to 1W)           │
        └─────────────────────────────┬──────────────────────────────┘
                                      │
                                      ▼
        ┌────────────────────────────────────────────────────────────┐
        │         AI PROBABILISTIC REASONING & VISION (GEMINI)       │
        ├────────────────────────────────────────────────────────────┤
        │ • Structured Real-Market Snapshot Synthesis                │
        │ • Multimodal Chart Screenshot Analysis (BOS, FVG, Patterns)│
        │ • Probabilistic Scenarios (Base Case, Alternative, Tail)   │
        │ • Invalidation Price Triggers & Honest Conflicting Evidence│
        └─────────────────────────────┬──────────────────────────────┘
                                      │
                                      ▼
        ┌────────────────────────────────────────────────────────────┐
        │          HIGH-PRECISION TRADING TERMINAL UI                │
        ├────────────────────────────────────────────────────────────┤
        │ • Interactive TradingView Candlestick Canvas               │
        │ • Real-Time Order Flow Footprint Grid & Cumulative Delta   │
        │ • Level-2 Depth of Market (DOM) Heatmap                    │
        │ • Live Macro Calendar Radar & News Sentiment Terminal     │
        │ • Real-Time Polling Engine with Data Freshness Indicator   │
        └────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Capabilities

### 1. Multi-Asset Live Feeds
- **Forex**: EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, NZD/USD, USD/CAD, EUR/GBP, EUR/JPY, GBP/JPY.
- **Commodities**: Gold (XAU/USD), Silver (XAG/USD), WTI Crude Oil, Brent Crude, Natural Gas.
- **Indices**: US30 (Dow Jones), NASDAQ 100, S&P 500, DAX 40, FTSE 100, Nikkei 225.
- **Crypto**: Bitcoin (BTC/USD), Ethereum (ETH/USD), Solana (SOL/USD).

### 2. Multi-Timeframe Confluence Analysis
Separately computes momentum, structural state, and trend across 8 discrete timeframes:
- **1 Minute** → Scalp volatility & immediate momentum
- **5 Minute** → Short-term structure
- **15 Minute** → Intraday primary trend
- **30 Minute** → Intraday value area
- **1 Hour** → Intermediate structural swing
- **4 Hour** → Institutional market regime
- **Daily** → Macro trend & cyclical baseline
- **Weekly** → Multi-month secular trajectory

### 3. Real Level 2 Order Flow & DOM
- **True Crypto DOM**: Connects directly to Binance live Level-2 depth (`/api/v3/depth`) and trade flow (`/api/v3/aggTrades`) to compute live bid/ask volumes, Cumulative Volume Delta (CVD), aggressor pressure %, and Point of Control (POC).
- **Strict Anti-Hallucination Compliance**: For OTC Forex and commodities where retail broker feeds do not expose centralized L2 books, the platform displays an explicit transparent disclosure:
  > *"Order-flow data unavailable for this instrument."*  
  > *"True order-book liquidity data is not available for this instrument/provider."*

### 4. Multimodal AI Chart Vision
- Upload any screenshot from TradingView, Bloomberg, MT4/MT5.
- Powered by Google Gemini 3.8 Flash multimodal vision to detect swing pivots, breaks of structure (BOS), change of character (CHoCH), Fair Value Gaps (FVG), and order blocks.

### 5. Sovereign Economic Calendar & News NLP
- **Economic Calendar**: Live ingestion of 100+ weekly sovereign releases from Forex Factory with country, impact tier, forecast, previous, and expected market volatility.
- **News Intelligence**: Live real-time financial wire feed from Finnhub & NewsAPI with natural language sentiment evaluation and affected currency tags.

### 6. Institutional Trading Terminal Design
- Dark-first Bloomberg / TradingView terminal aesthetic.
- Low-latency responsive layout built with Tailwind CSS and Next.js 14 App Router.
- Live polling ticker updates with automated staleness warning (`"LIVE • Updated X seconds ago"` / `"STALE DATA"`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/shivam-india/marketpulse-ai.git
cd marketpulse-ai
npm install
```

### 2. Configure Environment Variables
Copy the template to `.env.local`:
```bash
cp .env.example .env.local
```
Add your optional API keys (Gemini, Finnhub, Polygon, NewsAPI). The platform starts and operates gracefully even if keys are omitted.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Verification
```bash
npm run build
npm start
```

---

## 📁 Repository Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/outlook/route.ts      # AI scenario generation & reasoning
│   │   │   ├── ai/vision/route.ts       # Multimodal chart screenshot vision
│   │   │   ├── backtest/route.ts        # Walk-forward backtesting simulator
│   │   │   ├── calendar/route.ts        # Sovereign economic calendar feed
│   │   │   ├── health/route.ts          # Institutional system health probe
│   │   │   ├── markets/candles/route.ts # Historical candlestick bar resampling
│   │   │   ├── markets/quotes/route.ts  # Real-time multi-asset quotes
│   │   │   ├── news/route.ts            # Live market news & NLP sentiment
│   │   │   └── orderflow/route.ts       # Real L2 order flow & depth stream
│   │   ├── layout.tsx                   # Terminal viewport shell & typography
│   │   └── page.tsx                     # Main terminal control view
│   ├── components/
│   │   ├── asset/                       # Interactive chart, order flow, liquidity
│   │   ├── ai/                          # AI Outlook, Confluence Gauge, Why Modal
│   │   ├── calendar/                    # Economic Calendar radar view
│   │   ├── dashboard/                   # Global Market Overview dashboard
│   │   ├── layout/                      # Institutional Header, Sidebar, Ticker
│   │   ├── news/                        # Financial news intelligence feed
│   │   ├── scanner/                     # High-confluence market scanner
│   │   └── vision/                      # Chart upload modal & detection viewer
│   ├── lib/
│   │   ├── analysis/                    # Quant indicators, structure, regime, order flow
│   │   ├── data/                        # Asset catalog & instrument metadata
│   │   └── providers/                   # Polygon, Binance, Finnhub, Forex Factory
│   └── types/                           # Strict TypeScript domain interfaces
├── .env.example                         # Sanitized environment configuration template
├── .gitignore                           # Excludes secrets, node_modules, and build traces
├── package.json                         # Project dependencies and build scripts
└── README.md                            # Comprehensive platform documentation
```

---

## 🔒 Security & Privacy

- All API keys are isolated strictly on the server (`process.env`).
- Never exposed to the browser client or JavaScript bundles.
- Zero mock data in production logic; transparent fallback states when external feeds are disconnected.

---

## 📄 License
MIT License. Built for institutional-grade financial analytics and algorithmic research.
