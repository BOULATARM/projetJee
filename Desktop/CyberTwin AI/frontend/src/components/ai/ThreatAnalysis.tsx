"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Target, Shield, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { aiApi } from "@/lib/api";
import type { ThreatAnalysis, AttackType } from "@/types";
import { ATTACK_LABELS } from "@/types";

interface ThreatAnalysisProps {
  attackType: AttackType | null;
  simulationId?: string;
  compromisedNodes?: string[];
}

export default function ThreatAnalysisPanel({
  attackType,
  simulationId,
  compromisedNodes = [],
}: ThreatAnalysisProps) {
  const [analysis, setAnalysis] = useState<ThreatAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("summary");

  const fetchAnalysis = async () => {
    if (!attackType) return;
    setLoading(true);
    try {
      const result = await aiApi.analyze(attackType, simulationId);
      setAnalysis(result);
    } catch {}
    setLoading(false);
  };

  const riskColor = {
    Critical: "#ff3333",
    High: "#ff8c00",
    Medium: "#ffcc00",
    Low: "#00ff88",
  }[analysis?.risk_level || ""] || "#4a7a9b";

  const Section = ({
    id, title, children
  }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border border-cyber-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(expanded === id ? null : id)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/3 transition-colors"
      >
        <span className="text-xs font-semibold text-cyber-text uppercase tracking-wide">{title}</span>
        {expanded === id ? (
          <ChevronUp className="w-3.5 h-3.5 text-cyber-text-dim" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-cyber-text-dim" />
        )}
      </button>
      <AnimatePresence>
        {expanded === id && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (!attackType) {
    return (
      <div className="glass-panel rounded-xl p-5 flex flex-col items-center justify-center h-48 text-cyber-text-dim text-sm">
        <Brain className="w-8 h-8 mb-2 opacity-30" />
        <p>Launch a simulation to enable AI analysis</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyber-cyan" />
          <h3 className="text-sm font-semibold text-cyber-text">AI Threat Analysis</h3>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Brain className="w-3 h-3" />
          )}
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {!analysis && !loading && (
        <div className="text-xs text-cyber-text-dim text-center py-4">
          Click Analyze to generate AI threat analysis for{" "}
          <span className="text-cyber-cyan">{ATTACK_LABELS[attackType]}</span>
        </div>
      )}

      {analysis && (
        <div className="space-y-3">
          {/* Risk level */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div>
              <p className="text-xs text-cyber-text-dim">Attack Type</p>
              <p className="text-sm font-semibold text-cyber-text">{analysis.attack_type}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-cyber-text-dim">Risk Level</p>
              <p className="text-sm font-bold" style={{ color: riskColor }}>
                {analysis.risk_level.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-cyber-text-dim">Confidence</p>
              <p className="text-sm font-bold text-cyber-cyan">
                {Math.round(analysis.confidence_score * 100)}%
              </p>
            </div>
          </div>

          <Section id="summary" title="Executive Summary">
            <p className="text-xs text-cyber-text leading-relaxed">{analysis.summary}</p>
          </Section>

          <Section id="mitre" title="MITRE ATT&CK">
            <div className="flex flex-wrap gap-1.5">
              {analysis.mitre_techniques.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>

          <Section id="recommendations" title="Recommendations">
            <ul className="space-y-1.5">
              {analysis.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-cyber-text">
                  <span className="text-cyber-green mt-0.5 shrink-0">▸</span>
                  {r}
                </li>
              ))}
            </ul>
          </Section>

          {analysis.predicted_next_targets.length > 0 && (
            <Section id="predictions" title="Predicted Targets">
              <div className="flex flex-col gap-1.5">
                {analysis.predicted_next_targets.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-cyber-red" />
                    <span className="text-xs text-cyber-text font-mono">{t}</span>
                    <span className="ml-auto text-xs text-cyber-red">AT RISK</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
