"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Wifi, WifiOff, Shield, RefreshCw, X, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import type { Alert } from "@/types";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "text-red-400 border-red-800/60 bg-red-950/40",
  high:     "text-orange-400 border-orange-800/60 bg-orange-950/30",
  medium:   "text-yellow-400 border-yellow-800/50 bg-yellow-950/20",
  low:      "text-green-400 border-green-800/40 bg-green-950/20",
};

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high:     "bg-orange-500",
  medium:   "bg-yellow-500",
  low:      "bg-green-500",
};

interface HeaderProps {
  connected: boolean;
  threatScore: number;
  alertCount: number;
  alerts?: Alert[];
  onReset: () => void;
  onAcknowledge?: (id: string) => void;
}

export default function Header({
  connected,
  threatScore,
  alertCount,
  alerts = [],
  onReset,
  onAcknowledge,
}: HeaderProps) {
  const [resetting, setResetting] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useLang();

  const handleReset = async () => {
    setResetting(true);
    await onReset();
    setTimeout(() => setResetting(false), 1500);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const threatLevel =
    threatScore >= 75
      ? { label: t.critical, color: "text-cyber-red" }
      : threatScore >= 50
      ? { label: t.high,     color: "text-cyber-orange" }
      : threatScore >= 25
      ? { label: t.medium,   color: "text-cyber-yellow" }
      : { label: t.low,      color: "text-cyber-green" };

  const unacked = alerts.filter((a) => !a.acknowledged);

  return (
    <header className="glass-panel-dark border-b border-cyber-border px-6 py-3 flex items-center justify-between z-40 shrink-0 relative">
      {/* Left */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyber-cyan" />
          <span className="text-xs font-bold text-cyber-cyan tracking-widest uppercase">
            {t.soc}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-xs text-cyber-text-dim font-mono">
          <span>{t.system}</span>
          <span className="text-cyber-green terminal-text">{t.online}</span>
          <span className="mx-2 text-cyber-border">|</span>
          <span>{t.threatLevel}:</span>
          <span className={`font-bold ${threatLevel.color}`}>{threatLevel.label}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Threat Score */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-cyber-text-dim">{t.threatScore}</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-cyber-border rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  threatScore >= 75 ? "bg-cyber-red"
                  : threatScore >= 50 ? "bg-cyber-orange"
                  : threatScore >= 25 ? "bg-cyber-yellow"
                  : "bg-cyber-green"
                }`}
                animate={{ width: `${threatScore}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className={`text-xs font-bold font-mono ${
              threatScore >= 75 ? "text-cyber-red"
              : threatScore >= 50 ? "text-cyber-orange"
              : threatScore >= 25 ? "text-cyber-yellow"
              : "text-cyber-green"
            }`}>
              {threatScore}
            </span>
          </div>
        </div>

        {/* ── Notification Bell + Dropdown ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative text-cyber-text-dim hover:text-cyber-cyan transition-colors p-1"
          >
            <Bell className={`w-4 h-4 ${notifOpen ? "text-cyber-cyan" : ""}`} />
            {alertCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-cyber-red text-white text-xs rounded-full flex items-center justify-center font-bold"
              >
                {alertCount > 9 ? "9+" : alertCount}
              </motion.span>
            )}
          </button>

          {/* Dropdown panel */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                transition={{ duration: 0.18 }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-0 top-full mt-2 w-96 glass-panel border border-cyber-border rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border bg-cyber-panel/60">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span className="text-sm font-bold text-cyber-cyan font-mono">
                      {t.alerts}
                    </span>
                    {unacked.length > 0 && (
                      <span className="text-xs bg-cyber-red/20 text-red-400 border border-red-800/40 px-1.5 py-0.5 rounded font-mono">
                        {unacked.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-cyber-text-dim hover:text-cyber-cyan transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Alert list */}
                <div className="max-h-96 overflow-y-auto divide-y divide-cyber-border/40">
                  {unacked.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-cyber-text-dim">
                      <CheckCheck className="w-8 h-8 mb-2 text-cyber-green/40" />
                      <span className="text-sm">{t.noAlerts}</span>
                    </div>
                  ) : (
                    unacked.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`px-4 py-3 border-l-2 ${SEVERITY_COLOR[alert.severity] ?? SEVERITY_COLOR.low}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${SEVERITY_DOT[alert.severity] ?? "bg-gray-500"}`} />
                            <span className="text-xs font-bold text-cyber-text truncate">
                              {alert.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-mono text-cyber-text-dim/60">
                              {new Date(alert.timestamp).toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {onAcknowledge && (
                              <button
                                onClick={() => onAcknowledge(alert.id)}
                                title={t.acknowledge}
                                className="text-cyber-text-dim hover:text-cyber-green transition-colors"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-cyber-text-dim mt-1 leading-relaxed line-clamp-2 pl-4">
                          {alert.description}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 pl-4">
                          {alert.node_id && (
                            <span className="text-xs font-mono text-cyber-cyan/60 bg-cyber-cyan/5 px-1.5 py-0.5 rounded border border-cyber-cyan/10">
                              {alert.node_id}
                            </span>
                          )}
                          {alert.mitre_technique && (
                            <span className="text-xs font-mono text-cyber-purple/70 bg-cyber-purple/5 px-1.5 py-0.5 rounded border border-cyber-purple/10">
                              {alert.mitre_technique}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Language Switcher ── */}
        <div className="flex items-center gap-1 bg-cyber-border/30 rounded-lg p-0.5">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-all ${
                lang === l
                  ? "bg-cyber-cyan text-cyber-bg shadow"
                  : "text-cyber-text-dim hover:text-cyber-cyan"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          {connected ? (
            <>
              <Wifi className="w-4 h-4 text-cyber-green" />
              <span className="text-xs text-cyber-green terminal-text hidden sm:block">{t.live}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-cyber-red animate-pulse" />
              <span className="text-xs text-cyber-red hidden sm:block">{t.offline}</span>
            </>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-cyber-border text-cyber-text-dim hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${resetting ? "animate-spin" : ""}`} />
          <span className="hidden sm:block">{t.reset}</span>
        </button>
      </div>
    </header>
  );
}
