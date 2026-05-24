"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Shield,
  Activity,
  Target,
  TrendingUp,
  Server,
} from "lucide-react";
import type { DashboardMetrics } from "@/types";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
  index: number;
}

function StatCard({ label, value, sub, icon, color, glow, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`relative glass-panel rounded-xl p-5 cyber-corner overflow-hidden group hover:border-opacity-50 transition-all duration-300 ${color}`}
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glow}`}
        style={{ background: "radial-gradient(circle at 50% 50%, currentColor 0%, transparent 70%)", opacity: 0.03 }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-cyber-text-dim uppercase tracking-widest mb-1">{label}</p>
          <motion.p
            className={`text-3xl font-bold font-mono ${color}`}
            key={String(value)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {value}
          </motion.p>
          {sub && <p className="text-xs text-cyber-text-dim mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>

      {/* Animated bottom bar */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-cyber-border">
        <motion.div
          className={`h-full bg-current ${color}`}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
        />
      </div>
    </motion.div>
  );
}

interface StatsCardsProps {
  metrics: DashboardMetrics | null;
}

export default function StatsCards({ metrics }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Attacks",
      value: metrics?.total_attacks ?? 0,
      sub: "This session",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "text-cyber-red",
      glow: "text-cyber-red",
    },
    {
      label: "Active Threats",
      value: metrics?.active_threats ?? 0,
      sub: "Live simulations",
      icon: <Activity className="w-5 h-5" />,
      color: "text-cyber-orange",
      glow: "text-cyber-orange",
    },
    {
      label: "Compromised",
      value: metrics?.compromised_nodes ?? 0,
      sub: "Nodes affected",
      icon: <Server className="w-5 h-5" />,
      color: "text-cyber-red",
      glow: "text-cyber-red",
    },
    {
      label: "Threat Score",
      value: `${metrics?.threat_score ?? 0}`,
      sub: "/ 100 risk index",
      icon: <Target className="w-5 h-5" />,
      color:
        (metrics?.threat_score ?? 0) >= 75
          ? "text-cyber-red"
          : (metrics?.threat_score ?? 0) >= 50
          ? "text-cyber-orange"
          : "text-cyber-yellow",
      glow: "text-cyber-yellow",
    },
    {
      label: "Attacks Blocked",
      value: metrics?.attacks_blocked ?? 0,
      sub: "By firewall",
      icon: <Shield className="w-5 h-5" />,
      color: "text-cyber-green",
      glow: "text-cyber-green",
    },
    {
      label: "Network Health",
      value: `${metrics?.network_health ?? 100}%`,
      sub: "Infrastructure status",
      icon: <TrendingUp className="w-5 h-5" />,
      color:
        (metrics?.network_health ?? 100) >= 70
          ? "text-cyber-green"
          : (metrics?.network_health ?? 100) >= 40
          ? "text-cyber-yellow"
          : "text-cyber-red",
      glow: "text-cyber-green",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} index={i} />
      ))}
    </div>
  );
}
