"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, AlertTriangle, Server, Cpu } from "lucide-react";
import type { NetworkNode } from "@/types";
import { STATUS_COLORS, NODE_TYPE_ICONS } from "@/types";

interface NodeInfoPanelProps {
  node: NetworkNode | null;
  onClose: () => void;
}

export default function NodeInfoPanel({ node, onClose }: NodeInfoPanelProps) {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-4 right-4 w-64 glass-panel rounded-xl p-4 z-20 border border-cyber-border"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{NODE_TYPE_ICONS[node.type]}</span>
              <div>
                <h3 className="text-sm font-semibold text-cyber-text">{node.label}</h3>
                <p className="text-xs text-cyber-text-dim capitalize">{node.type}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-cyber-text-dim hover:text-cyber-cyan transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-white/5">
            <span className="text-xs text-cyber-text-dim">Status</span>
            <span
              className="text-xs font-bold capitalize"
              style={{ color: STATUS_COLORS[node.status] }}
            >
              ● {node.status}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-cyber-text-dim">IP Address</span>
              <span className="text-cyber-cyan font-mono">{node.ip}</span>
            </div>
            {node.os && (
              <div className="flex justify-between">
                <span className="text-cyber-text-dim">OS</span>
                <span className="text-cyber-text font-mono text-right">{node.os}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-cyber-text-dim">Risk Score</span>
              <span
                className="font-bold font-mono"
                style={{
                  color:
                    node.risk_score >= 0.7
                      ? "#ff3333"
                      : node.risk_score >= 0.4
                      ? "#ffcc00"
                      : "#00ff88",
                }}
              >
                {Math.round(node.risk_score * 100)}%
              </span>
            </div>
          </div>

          {/* Services */}
          {node.services.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-cyber-text-dim mb-1.5">Services</p>
              <div className="flex flex-wrap gap-1">
                {node.services.map((svc) => (
                  <span
                    key={svc}
                    className="text-xs px-2 py-0.5 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Risk bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-cyber-text-dim mb-1">
              <span>Risk Level</span>
              <span>{Math.round(node.risk_score * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-cyber-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    node.risk_score >= 0.7
                      ? "#ff3333"
                      : node.risk_score >= 0.4
                      ? "#ffcc00"
                      : "#00ff88",
                  width: `${node.risk_score * 100}%`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${node.risk_score * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
