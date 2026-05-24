"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Network,
  Zap,
  Bell,
  MessageSquare,
  Map,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const NAV_ICONS = [
  { id: "dashboard",  icon: LayoutDashboard, key: "dashboard"  as const },
  { id: "network",    icon: Network,         key: "network"    as const },
  { id: "simulation", icon: Zap,             key: "simulation" as const },
  { id: "alerts",     icon: Bell,            key: "alertCenter" as const },
  { id: "timeline",   icon: Clock,           key: "timeline"   as const },
  { id: "heatmap",    icon: Map,             key: "heatmap"    as const },
  { id: "mitre",      icon: Shield,          key: "mitre"      as const },
  { id: "ai-chat",    icon: MessageSquare,   key: "aiAnalyst"  as const },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLang();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full glass-panel-dark border-r border-cyber-border z-20 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-cyber-border overflow-hidden">
        <div className="w-8 h-8 rounded bg-cyber-cyan/10 border border-cyber-cyan/40 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-cyber-cyan" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-bold text-cyber-cyan cyber-text-glow">CyberTwin</p>
              <p className="text-xs text-cyber-text-dim">AI Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ICONS.map(({ id, icon: Icon, key }) => {
          const active = activeSection === id;
          const label = t[key];
          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                active
                  ? "bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30"
                  : "text-cyber-text-dim hover:text-cyber-text hover:bg-white/5 border border-transparent"
              }`}
              title={collapsed ? label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-cyber-cyan/5 rounded-lg"
                />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 relative z-10 ${
                  active ? "text-cyber-cyan drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]" : ""
                }`}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium overflow-hidden whitespace-nowrap relative z-10"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Version */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 border-t border-cyber-border"
          >
            <p className="text-xs text-cyber-text-dim terminal-text">v1.0.0 — ACTIVE</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cyber-panel border border-cyber-border flex items-center justify-center text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors z-30"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
