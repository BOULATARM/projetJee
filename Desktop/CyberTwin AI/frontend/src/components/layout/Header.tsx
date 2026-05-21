"use client";

import { motion } from "framer-motion";
import { Bell, Wifi, WifiOff, Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  connected: boolean;
  threatScore: number;
  alertCount: number;
  onReset: () => void;
}

export default function Header({ connected, threatScore, alertCount, onReset }: HeaderProps) {
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await onReset();
    setTimeout(() => setResetting(false), 1500);
  };

  const threatLevel =
    threatScore >= 75
      ? { label: "CRITICAL", color: "text-cyber-red" }
      : threatScore >= 50
      ? { label: "HIGH", color: "text-cyber-orange" }
      : threatScore >= 25
      ? { label: "MEDIUM", color: "text-cyber-yellow" }
      : { label: "LOW", color: "text-cyber-green" };

  return (
    <header className="glass-panel-dark border-b border-cyber-border px-6 py-3 flex items-center justify-between z-10 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyber-cyan" />
          <span className="text-xs font-bold text-cyber-cyan tracking-widest uppercase">
            Security Operations Center
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-xs text-cyber-text-dim font-mono">
          <span>SYSTEM</span>
          <span className="text-cyber-green terminal-text">ONLINE</span>
          <span className="mx-2 text-cyber-border">|</span>
          <span>THREAT LEVEL:</span>
          <span className={`font-bold ${threatLevel.color}`}>{threatLevel.label}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Threat Score */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-cyber-text-dim">Threat Score</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-cyber-border rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  threatScore >= 75
                    ? "bg-cyber-red"
                    : threatScore >= 50
                    ? "bg-cyber-orange"
                    : threatScore >= 25
                    ? "bg-cyber-yellow"
                    : "bg-cyber-green"
                }`}
                animate={{ width: `${threatScore}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span
              className={`text-xs font-bold font-mono ${
                threatScore >= 75
                  ? "text-cyber-red"
                  : threatScore >= 50
                  ? "text-cyber-orange"
                  : threatScore >= 25
                  ? "text-cyber-yellow"
                  : "text-cyber-green"
              }`}
            >
              {threatScore}
            </span>
          </div>
        </div>

        {/* Alerts */}
        <button className="relative text-cyber-text-dim hover:text-cyber-cyan transition-colors">
          <Bell className="w-4 h-4" />
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

        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          {connected ? (
            <>
              <Wifi className="w-4 h-4 text-cyber-green" />
              <span className="text-xs text-cyber-green terminal-text hidden sm:block">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-cyber-red animate-pulse" />
              <span className="text-xs text-cyber-red hidden sm:block">OFFLINE</span>
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
          <span className="hidden sm:block">Reset</span>
        </button>
      </div>
    </header>
  );
}
