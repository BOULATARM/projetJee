"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, ExternalLink, RefreshCw, Database } from "lucide-react";
import { cveApi, type CveEntry } from "@/lib/api";

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#ff3333",
  HIGH:     "#ff8c00",
  MEDIUM:   "#ffcc00",
  LOW:      "#00ff88",
};

const SCORE_BG: Record<string, string> = {
  CRITICAL: "bg-red-950/60 border-red-800/50",
  HIGH:     "bg-orange-950/60 border-orange-800/50",
  MEDIUM:   "bg-yellow-950/40 border-yellow-800/40",
  LOW:      "bg-green-950/40 border-green-800/30",
};

interface CveIntelligenceProps {
  attackType: string;
  autoFetch?: boolean;
}

export default function CveIntelligence({ attackType, autoFetch = true }: CveIntelligenceProps) {
  const [cves, setCves] = useState<CveEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await cveApi.getForAttack(attackType, 5);
      setCves(res.cves);
      setSource(res.source);
      setLastFetch(new Date());
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && attackType) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attackType]);

  const cvssColor = (score: number) =>
    score >= 9 ? "#ff3333" : score >= 7 ? "#ff8c00" : score >= 4 ? "#ffcc00" : "#00ff88";

  return (
    <div className="glass-panel rounded-xl p-4 border border-cyber-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyber-cyan" />
          <span className="text-sm font-bold text-cyber-cyan font-mono tracking-wider">
            CVE INTELLIGENCE
          </span>
          <span className="text-xs text-cyber-text-dim px-1.5 py-0.5 rounded bg-cyber-border/50 font-mono">
            NVD NIST
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <span className="text-xs text-cyber-text-dim font-mono">
              {lastFetch.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetch}
            disabled={loading}
            className="p-1.5 rounded hover:bg-cyber-border/30 text-cyber-text-dim hover:text-cyber-cyan transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Attack type badge */}
      <div className="mb-3 text-xs font-mono text-cyber-text-dim">
        Showing CVEs for:{" "}
        <span className="text-cyber-yellow font-bold">
          {attackType.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      {/* CVE List */}
      {loading && cves.length === 0 ? (
        <div className="flex items-center gap-2 text-cyber-text-dim text-sm py-4 justify-center">
          <RefreshCw className="w-4 h-4 animate-spin text-cyber-cyan" />
          <span>Fetching from NVD NIST...</span>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {cves.map((cve, i) => (
              <motion.div
                key={cve.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-lg border p-3 ${SCORE_BG[cve.severity] ?? "bg-cyber-panel/40 border-cyber-border"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* CVE ID */}
                    <span className="font-mono text-xs font-bold text-white">
                      {cve.id}
                    </span>
                    {/* Severity badge */}
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded font-mono"
                      style={{
                        color: SEVERITY_COLORS[cve.severity] ?? "#aaa",
                        backgroundColor: `${SEVERITY_COLORS[cve.severity] ?? "#aaa"}18`,
                        border: `1px solid ${SEVERITY_COLORS[cve.severity] ?? "#aaa"}40`,
                      }}
                    >
                      {cve.severity}
                    </span>
                  </div>

                  {/* CVSS Score */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Shield className="w-3 h-3" style={{ color: cvssColor(cve.score) }} />
                    <span
                      className="text-sm font-bold font-mono"
                      style={{ color: cvssColor(cve.score) }}
                    >
                      {cve.score.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-cyber-text-dim leading-relaxed line-clamp-2">
                  {cve.desc}
                </p>

                {/* NVD link */}
                <a
                  href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyber-cyan/60 hover:text-cyber-cyan mt-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on NVD
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {cves.length === 0 && !loading && (
        <div className="text-center py-4 text-cyber-text-dim text-xs">
          <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-cyber-yellow/40" />
          No CVE data available
        </div>
      )}

      {/* Source footnote */}
      {source && (
        <p className="text-xs text-cyber-text-dim/50 mt-3 text-center font-mono">
          Source: {source}
        </p>
      )}
    </div>
  );
}
