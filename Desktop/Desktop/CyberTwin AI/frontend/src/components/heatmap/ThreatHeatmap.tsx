"use client";

import { motion } from "framer-motion";
import { Map } from "lucide-react";
import type { NetworkNode } from "@/types";
import { STATUS_COLORS, NODE_TYPE_ICONS } from "@/types";

interface ThreatHeatmapProps {
  nodes: NetworkNode[];
}

export default function ThreatHeatmap({ nodes }: ThreatHeatmapProps) {
  const maxRisk = Math.max(...nodes.map((n) => n.risk_score), 1);

  const statusOrder = { critical: 0, compromised: 1, suspicious: 2, offline: 3, safe: 4 };
  const sorted = [...nodes].sort(
    (a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5)
  );

  const getCellColor = (node: NetworkNode) => {
    const intensity = node.risk_score / maxRisk;
    switch (node.status) {
      case "critical": return `rgba(255,51,51,${0.3 + intensity * 0.7})`;
      case "compromised": return `rgba(255,102,0,${0.2 + intensity * 0.6})`;
      case "suspicious": return `rgba(255,204,0,${0.2 + intensity * 0.5})`;
      case "safe": return `rgba(0,255,136,${0.05 + intensity * 0.15})`;
      default: return "rgba(74,122,155,0.1)";
    }
  };

  const riskGroups = {
    critical: nodes.filter((n) => n.status === "critical"),
    compromised: nodes.filter((n) => n.status === "compromised"),
    suspicious: nodes.filter((n) => n.status === "suspicious"),
    safe: nodes.filter((n) => n.status === "safe"),
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-cyber-cyan" />
          <h2 className="text-sm font-semibold text-cyber-text">Threat Heatmap</h2>
        </div>
        <div className="text-xs text-cyber-text-dim">
          {nodes.filter((n) => n.status !== "safe").length} nodes at risk
        </div>
      </div>

      {/* Risk breakdown */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(riskGroups).map(([status, ns]) => (
          <div
            key={status}
            className="text-center p-2 rounded-lg border"
            style={{
              borderColor: `${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}30`,
              backgroundColor: `${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}08`,
            }}
          >
            <p
              className="text-xl font-bold font-mono"
              style={{ color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}
            >
              {ns.length}
            </p>
            <p className="text-xs text-cyber-text-dim capitalize">{status}</p>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 gap-2">
          {sorted.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="relative p-3 rounded-xl border text-center cursor-default group"
              style={{
                backgroundColor: getCellColor(node),
                borderColor: `${STATUS_COLORS[node.status]}40`,
              }}
            >
              {/* Pulse for critical */}
              {node.status === "critical" && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ border: `1px solid ${STATUS_COLORS.critical}` }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              <div className="text-lg mb-1">{NODE_TYPE_ICONS[node.type]}</div>
              <p className="text-xs font-medium text-cyber-text leading-tight truncate">
                {node.label}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: STATUS_COLORS[node.status] }}>
                {node.status.toUpperCase()}
              </p>

              {/* Risk score bar */}
              <div className="w-full h-1 bg-cyber-border rounded-full mt-1.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[node.status] }}
                  animate={{ width: `${node.risk_score * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                />
              </div>
              <p className="text-xs text-cyber-text-dim font-mono mt-0.5">
                {Math.round(node.risk_score * 100)}%
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Risk scale legend */}
      <div className="mt-3 pt-3 border-t border-cyber-border">
        <div className="flex items-center justify-between text-xs text-cyber-text-dim mb-1">
          <span>Risk Scale</span>
          <span>Low → Critical</span>
        </div>
        <div className="h-2 rounded-full" style={{
          background: "linear-gradient(to right, rgba(0,255,136,0.3), rgba(255,204,0,0.5), rgba(255,102,0,0.6), rgba(255,51,51,0.8))"
        }} />
      </div>
    </div>
  );
}
