"use client";

import React, { useEffect, useRef, useState } from "react";
import { OHLCV, Timeframe, AssetInfo, SupportResistanceLevel } from "@/types/market";
import { calculateEMA } from "@/lib/analysis/technical-indicators";
import { Maximize2, RefreshCw, Eye, EyeOff, Layers } from "lucide-react";

interface InteractiveChartProps {
  asset: AssetInfo;
  timeframe: Timeframe;
  bars: OHLCV[];
  supportLevels?: SupportResistanceLevel[];
  resistanceLevels?: SupportResistanceLevel[];
  onTimeframeChange: (tf: Timeframe) => void;
  onRefresh?: () => void;
}

export function InteractiveChart({
  asset,
  timeframe,
  bars,
  supportLevels = [],
  resistanceLevels = [],
  onTimeframeChange,
  onRefresh,
}: InteractiveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);

  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(true);
  const [showSRLines, setShowSRLines] = useState(true);

  const timeframes: { id: Timeframe; label: string }[] = [
    { id: "1m", label: "1M" },
    { id: "5m", label: "5M" },
    { id: "15m", label: "15M" },
    { id: "30m", label: "30M" },
    { id: "1h", label: "1H" },
    { id: "4h", label: "4H" },
    { id: "1d", label: "1D" },
    { id: "1w", label: "1W" },
  ];

  useEffect(() => {
    if (!chartContainerRef.current || bars.length === 0) return;

    let isMounted = true;

    async function initChart() {
      const { createChart, ColorType, CrosshairMode } = await import("lightweight-charts");

      if (!isMounted || !chartContainerRef.current) return;

      // Clean up previous instance
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#080c14" },
          textColor: "#94a3b8",
          fontSize: 11,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        },
        grid: {
          vertLines: { color: "rgba(255, 255, 255, 0.04)" },
          horzLines: { color: "rgba(255, 255, 255, 0.04)" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: "rgba(56, 189, 248, 0.5)",
            width: 1,
            style: 2,
            labelBackgroundColor: "#0f172a",
          },
          horzLine: {
            color: "rgba(56, 189, 248, 0.5)",
            width: 1,
            style: 2,
            labelBackgroundColor: "#0f172a",
          },
        },
        rightPriceScale: {
          borderColor: "rgba(255, 255, 255, 0.1)",
          scaleMargins: {
            top: 0.1,
            bottom: 0.2,
          },
        },
        timeScale: {
          borderColor: "rgba(255, 255, 255, 0.1)",
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartInstanceRef.current = chart;

      // Candlestick series
      const candleSeries = chart.addCandlestickSeries({
        upColor: "#10b981",
        downColor: "#f43f5e",
        borderVisible: false,
        wickUpColor: "#10b981",
        wickDownColor: "#f43f5e",
      });
      candleSeriesRef.current = candleSeries;

      const candleData = bars.map((b) => ({
        time: b.time as any,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }));
      candleSeries.setData(candleData);

      // Volume histogram series
      const volumeSeries = chart.addHistogramSeries({
        color: "#1e293b",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "", // overlay
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = bars.map((b) => ({
        time: b.time as any,
        value: b.volume,
        color: b.close >= b.open ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)",
      }));
      volumeSeries.setData(volumeData);

      // EMA Overlays
      const closes = bars.map((b) => b.close);

      if (showEMA20) {
        const ema20 = calculateEMA(closes, 20);
        const ema20Series = chart.addLineSeries({
          color: "#38bdf8",
          lineWidth: 1,
          title: "EMA 20",
        });
        ema20Series.setData(
          bars.map((b, i) => ({ time: b.time as any, value: ema20[i] }))
        );
      }

      if (showEMA50) {
        const ema50 = calculateEMA(closes, 50);
        const ema50Series = chart.addLineSeries({
          color: "#fbbf24",
          lineWidth: 1,
          title: "EMA 50",
        });
        ema50Series.setData(
          bars.map((b, i) => ({ time: b.time as any, value: ema50[i] }))
        );
      }

      if (showEMA200) {
        const ema200 = calculateEMA(closes, 200);
        const ema200Series = chart.addLineSeries({
          color: "#c084fc",
          lineWidth: 1,
          title: "EMA 200",
        });
        ema200Series.setData(
          bars.map((b, i) => ({ time: b.time as any, value: ema200[i] }))
        );
      }

      // Add horizontal Support & Resistance price lines
      if (showSRLines) {
        resistanceLevels.slice(0, 2).forEach((res) => {
          candleSeries.createPriceLine({
            price: res.price,
            color: "rgba(244, 63, 94, 0.65)",
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `Res (${res.price})`,
          });
        });

        supportLevels.slice(0, 2).forEach((sup) => {
          candleSeries.createPriceLine({
            price: sup.price,
            color: "rgba(16, 185, 129, 0.65)",
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `Sup (${sup.price})`,
          });
        });
      }

      chart.timeScale().fitContent();

      // Resize observer
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(chartContainerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }

    initChart();

    return () => {
      isMounted = false;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [bars, timeframe, showEMA20, showEMA50, showEMA200, showSRLines, supportLevels, resistanceLevels]);

  return (
    <div className="flex flex-col h-[520px] w-full bg-[#080c14] border border-white/10 rounded-lg overflow-hidden">
      {/* Top Chart Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-white/10 bg-[#0a0f1d] text-xs font-mono">
        <div className="flex items-center space-x-2">
          {/* Timeframe Selector Buttons */}
          <div className="flex items-center space-x-1 bg-black/40 p-0.5 rounded border border-white/5">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => onTimeframeChange(tf.id)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  timeframe === tf.id
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-1"></div>

          {/* Indicator Toggles */}
          <div className="hidden sm:flex items-center space-x-1 text-[11px]">
            <button
              onClick={() => setShowEMA20(!showEMA20)}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                showEMA20
                  ? "border-sky-500/40 bg-sky-500/20 text-sky-300"
                  : "border-white/5 bg-white/5 text-slate-500"
              }`}
            >
              EMA 20
            </button>
            <button
              onClick={() => setShowEMA50(!showEMA50)}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                showEMA50
                  ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                  : "border-white/5 bg-white/5 text-slate-500"
              }`}
            >
              EMA 50
            </button>
            <button
              onClick={() => setShowEMA200(!showEMA200)}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                showEMA200
                  ? "border-purple-500/40 bg-purple-500/20 text-purple-300"
                  : "border-white/5 bg-white/5 text-slate-500"
              }`}
            >
              EMA 200
            </button>
            <button
              onClick={() => setShowSRLines(!showSRLines)}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                showSRLines
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                  : "border-white/5 bg-white/5 text-slate-500"
              }`}
            >
              S/R Levels
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <div className="hidden lg:flex items-center space-x-2 text-[10px]">
            <span className="flex items-center text-sky-400">
              <span className="w-2 h-0.5 bg-sky-400 mr-1"></span> EMA20
            </span>
            <span className="flex items-center text-amber-400">
              <span className="w-2 h-0.5 bg-amber-400 mr-1"></span> EMA50
            </span>
            <span className="flex items-center text-purple-400">
              <span className="w-2 h-0.5 bg-purple-400 mr-1"></span> EMA200
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 hover:text-white transition-colors"
              title="Refresh Chart Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Candlestick Canvas Container */}
      <div ref={chartContainerRef} className="flex-1 w-full relative">
        {bars.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 font-mono text-center p-6 bg-[#080c14]/90 z-10">
            <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <EyeOff className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">Live data unavailable</div>
            <p className="text-xs text-slate-400 max-w-md">
              Real-time candlestick bars are currently unavailable for {asset.symbol} on the {timeframe.toUpperCase()} timeframe from {asset.dataSource}.
            </p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3 py-1.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/30 transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Live Feed</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

