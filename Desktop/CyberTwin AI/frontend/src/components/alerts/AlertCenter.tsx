"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Filter, Check, AlertTriangle, AlertCircle, Info, Zap } from "lucide-react";
import { simulationApi } from "@/lib/api";
import type { Alert, SeverityLevel } from "@/types";
import { SEVERITY_COLORS, ATTACK_LABELS } from "@/types";

const SEVERITY_ICONS: Record<SeverityLevel, React.ReactNode> = {
  critical: <Zap className="w-3.5 h-3.5" />,
  high: <AlertTriangle className="w-3.5 h-3.5" />,
  medium: <AlertCircle className="w-3.5 h-3.5" />,
  low: <Info className="w-3.5 h-3.5" />,
};

function AlertItem({ alert, onAck }: { alert: Alert; onAck: (id: string) => void }) {
  const color = SEVERITY_COLORS[alert.severity];
  const timeAgo = new Date(alert.timestamp).toLocaleTimeString();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className={`relative flex items-start gap-3 p-3 rounded-lg border transition-all ${
        alert.acknowledged
          ? "opacity-50 bg-white/2 border-cyber-border/30"
          : "bg-white/5 border-cyber-border hover:border-opacity-50"
      }`}
      style={{ borderColor: alert.acknowledged ? undefined : `${color}30` }}
    >
      {/* Severity indicator */}
      <div
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {SEVERITY_ICONS[alert.severity]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-cyber-text leading-tight">{alert.title}</p>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {alert.severity.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-cyber-text-dim mt-0.5 leading-relaxed truncate">
          {alert.description}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-cyber-text-dim">
          <span className="font-mono">{timeAgo}</span>
          {alert.node_id && (
            <span className="text-cyber-cyan">Node: {alert.node_id}</span>
          )}
          {alert.mitre_technique && (
            <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded">{alert.mitre_technique}</span>
          )}
        </div>
      </div>

      {!alert.acknowledged && (
        <button
          onClick={() => onAck(alert.id)}
          className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-cyber-text-dim hover:text-cyber-green hover:bg-cyber-green/10 transition-colors"
          title="Acknowledge"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Left accent bar */}
      {!alert.acknowledged && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg"
          style={{ backgroundColor: color }}
        />
      )}
    </motion.div>
  );
}

interface AlertCenterProps {
  externalAlerts?: Alert[];
}

export default function AlertCenter({ externalAlerts = [] }: AlertCenterProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<SeverityLevel | "all">("all");
  const [loading, setLoading] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const fetched = await simulationApi.getAlerts(50);
      setAlerts(fetched);
    } catch {
      // backend not available
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  useEffect(() => {
    if (externalAlerts.length > 0) {
      setAlerts((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newAlerts = externalAlerts.filter((a) => !existingIds.has(a.id));
        return [...newAlerts, ...prev];
      });
    }
  }, [externalAlerts]);

  const handleAck = async (id: string) => {
    try {
      await simulationApi.acknowledgeAlert(id);
    } catch {}
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const filtered =
    filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const counts = {
    critical: alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length,
    high: alerts.filter((a) => a.severity === "high" && !a.acknowledged).length,
    medium: alerts.filter((a) => a.severity === "medium" && !a.acknowledged).length,
    low: alerts.filter((a) => a.severity === "low" && !a.acknowledged).length,
  };

  const FILTERS: (SeverityLevel | "all")[] = ["all", "critical", "high", "medium", "low"];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyber-cyan" />
          <h2 className="text-sm font-semibold text-cyber-text">Alert Center</h2>
          {counts.critical > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-1.5 py-0.5 text-xs bg-cyber-red/20 text-cyber-red rounded-full font-bold"
            >
              {counts.critical} CRITICAL
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-cyber-text-dim">
          <span>{alerts.filter((a) => !a.acknowledged).length} active</span>
        </div>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(["critical", "high", "medium", "low"] as SeverityLevel[]).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(sev === filter ? "all" : sev)}
            className={`p-2 rounded-lg text-center transition-all border ${
              filter === sev
                ? "border-opacity-50 bg-white/5"
                : "border-cyber-border/30 hover:bg-white/3"
            }`}
            style={{ borderColor: filter === sev ? SEVERITY_COLORS[sev] : undefined }}
          >
            <p className="text-lg font-bold font-mono" style={{ color: SEVERITY_COLORS[sev] }}>
              {counts[sev]}
            </p>
            <p className="text-xs text-cyber-text-dim capitalize">{sev}</p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-full transition-all capitalize ${
              filter === f
                ? "bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30"
                : "text-cyber-text-dim hover:text-cyber-text"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-40 text-cyber-text-dim text-sm"
            >
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p>No alerts</p>
              <p className="text-xs mt-1">Launch a simulation to generate alerts</p>
            </motion.div>
          ) : (
            filtered.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onAck={handleAck} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
