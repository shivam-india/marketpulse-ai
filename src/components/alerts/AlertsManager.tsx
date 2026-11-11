"use client";

import React, { useState } from "react";
import { INITIAL_ALERTS } from "@/lib/storage/store";
import { UserAlert, AssetInfo } from "@/types/market";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { Bell, Plus, Trash2, X, CheckCircle, ShieldAlert } from "lucide-react";

interface AlertsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  activeAsset: AssetInfo;
}

export function AlertsManager({ isOpen, onClose, activeAsset }: AlertsManagerProps) {
  const [alerts, setAlerts] = useState<UserAlert[]>(INITIAL_ALERTS);
  const [newSymbol, setNewSymbol] = useState(activeAsset.symbol);
  const [alertType, setAlertType] = useState<UserAlert["type"]>("confidence_threshold");
  const [targetValue, setTargetValue] = useState("75");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: UserAlert = {
      id: `alert-${Date.now()}`,
      assetSymbol: newSymbol,
      type: alertType,
      targetValue,
      isActive: true,
      createdAt: new Date().toISOString(),
      notifyBrowser: true,
      message:
        message ||
        `Alert triggered for ${newSymbol} (${alertType.replace(/_/g, " ")}) at threshold ${targetValue}`,
    };

    setAlerts([newAlert, ...alerts]);
    setMessage("");

    // Request browser notification permission if available
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="bg-[#0b101c] border border-white/15 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Confluence & Volatility Alert Engine
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Set autonomous triggers for structural breaks, confidence spikes, and high-impact macro releases.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleCreateAlert} className="p-3.5 rounded-lg bg-[#070b14] border border-white/10 space-y-3">
          <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
            Create New Market Trigger
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Asset</label>
              <select
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="w-full bg-[#0d1424] text-white p-2 rounded border border-white/10 text-xs"
              >
                {SUPPORTED_ASSETS.map((a) => (
                  <option key={a.id} value={a.symbol}>
                    {a.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Trigger Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as any)}
                className="w-full bg-[#0d1424] text-white p-2 rounded border border-white/10 text-xs"
              >
                <option value="confidence_threshold">Confidence Threshold (%)</option>
                <option value="price_cross">Price Level Cross</option>
                <option value="bos_detected">Break of Structure (BOS)</option>
                <option value="liquidity_sweep">Liquidity Sweep Event</option>
                <option value="economic_event">Pre-Macro Event (15m Prior)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Target Threshold</label>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 75, 2700.0, BOS_BULL"
                className="w-full bg-[#0d1424] text-white p-2 rounded border border-white/10 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1">Custom Alert Note (Optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Alert me when Gold bullish confluence exceeds 75%"
              className="w-full bg-[#0d1424] text-white p-2 rounded border border-white/10 text-xs"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Activate Trigger</span>
            </button>
          </div>
        </form>

        {/* Active Alerts List */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Active User Alerts ({alerts.length})
          </div>

          <div className="space-y-1.5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded bg-white/[0.02] border border-white/5 text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{alert.assetSymbol}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold uppercase">
                      {alert.type.replace(/_/g, " ")}: {alert.targetValue}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{alert.message}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleAlert(alert.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {alert.isActive ? "ACTIVE" : "PAUSED"}
                  </button>

                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

