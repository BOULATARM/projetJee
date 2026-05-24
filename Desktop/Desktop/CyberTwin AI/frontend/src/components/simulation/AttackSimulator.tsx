"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, Square, AlertTriangle, ChevronDown, Info } from "lucide-react";
import { simulationApi } from "@/lib/api";
import type { AttackType, SimulationResult } from "@/types";
import { ATTACK_LABELS } from "@/types";

const ATTACK_DESCRIPTIONS: Record<AttackType, { desc: string; mitre: string; color: string }> = {
  sql_injection: { desc: "Inject malicious SQL into database queries", mitre: "T1190", color: "#ff8c00" },
  xss: { desc: "Cross-site scripting in web applications", mitre: "T1059.007", color: "#ffcc00" },
  brute_force: { desc: "Automated password guessing attack", mitre: "T1110", color: "#ff6600" },
  ddos: { desc: "Distributed denial-of-service flood", mitre: "T1498", color: "#ff3333" },
  ransomware: { desc: "Encrypt files and demand ransom", mitre: "T1486", color: "#ff0033" },
  phishing: { desc: "Social engineering via email", mitre: "T1566", color: "#ff8c00" },
  malware: { desc: "Malicious software infection", mitre: "T1204", color: "#ff6600" },
  lateral_movement: { desc: "Move through network using credentials", mitre: "T1021", color: "#aa00ff" },
  credential_stuffing: { desc: "Use stolen credentials for access", mitre: "T1110.004", color: "#ff8c00" },
  port_scan: { desc: "Map open ports and services", mitre: "T1046", color: "#00d4ff" },
  zero_day: { desc: "Exploit unknown vulnerability", mitre: "T1203", color: "#ff0033" },
  man_in_the_middle: { desc: "Intercept network communications", mitre: "T1557", color: "#aa00ff" },
};

interface AttackSimulatorProps {
  onSimulationStart?: (result: SimulationResult) => void;
}

export default function AttackSimulator({ onSimulationStart }: AttackSimulatorProps) {
  const [selectedAttack, setSelectedAttack] = useState<AttackType>("ransomware");
  const [intensity, setIntensity] = useState(0.7);
  const [propagate, setPropagate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeSimId, setActiveSimId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAttackList, setShowAttackList] = useState(false);
  const [recentSims, setRecentSims] = useState<SimulationResult[]>([]);

  const handleLaunch = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await simulationApi.start(selectedAttack, {
        intensity,
        propagate,
        duration_seconds: 45,
      });
      setActiveSimId(result.simulation_id);

      const mockResult: SimulationResult = {
        simulation_id: result.simulation_id,
        attack_type: selectedAttack,
        start_time: new Date().toISOString(),
        events: [],
        compromised_nodes: [],
        total_damage_score: 0,
        status: "running",
      };
      setRecentSims((prev) => [mockResult, ...prev].slice(0, 5));
      onSimulationStart?.(mockResult);

      await simulationApi.generateAlerts(selectedAttack, 3);
    } catch (e) {
      setError("Failed to connect to simulation engine. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const info = ATTACK_DESCRIPTIONS[selectedAttack];

  return (
    <div className="space-y-4">
      {/* Attack type selector */}
      <div className="glass-panel rounded-xl p-5">
        <h3 className="text-sm font-semibold text-cyber-text mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyber-cyan" />
          Attack Scenario
        </h3>

        <div className="relative">
          <button
            onClick={() => setShowAttackList((s) => !s)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-cyber-border hover:border-cyber-cyan/40 transition-all text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: info.color, boxShadow: `0 0 6px ${info.color}` }}
              />
              <span className="text-cyber-text font-medium">{ATTACK_LABELS[selectedAttack]}</span>
              <span className="text-xs text-cyber-text-dim font-mono">({info.mitre})</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-cyber-text-dim transition-transform ${showAttackList ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {showAttackList && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="absolute top-full mt-1 w-full bg-cyber-panel border border-cyber-border rounded-xl overflow-hidden z-50 shadow-xl"
              >
                <div className="max-h-64 overflow-y-auto">
                  {(Object.keys(ATTACK_LABELS) as AttackType[]).map((type) => {
                    const d = ATTACK_DESCRIPTIONS[type];
                    return (
                      <button
                        key={type}
                        onClick={() => { setSelectedAttack(type); setShowAttackList(false); }}
                        className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
                          selectedAttack === type ? "bg-cyber-cyan/5" : ""
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <div>
                          <p className="text-sm text-cyber-text font-medium">{ATTACK_LABELS[type]}</p>
                          <p className="text-xs text-cyber-text-dim">{d.desc}</p>
                        </div>
                        <span className="ml-auto text-xs text-cyber-text-dim font-mono shrink-0 mt-0.5">
                          {d.mitre}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Description */}
        <div className="mt-3 p-3 rounded-lg bg-white/3 border border-cyber-border/50 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-cyber-cyan mt-0.5 shrink-0" />
          <p className="text-xs text-cyber-text-dim">{info.desc}</p>
        </div>
      </div>

      {/* Config */}
      <div className="glass-panel rounded-xl p-5">
        <h3 className="text-sm font-semibold text-cyber-text mb-4">Configuration</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-cyber-text-dim">Attack Intensity</span>
              <span className="text-cyber-cyan font-mono font-bold">
                {Math.round(intensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00d4ff ${intensity * 100}%, #0a3050 ${intensity * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-cyber-text-dim mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm text-cyber-text">Enable Propagation</p>
              <p className="text-xs text-cyber-text-dim">Spread to adjacent nodes</p>
            </div>
            <div
              className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
                propagate ? "bg-cyber-cyan" : "bg-cyber-border"
              }`}
              onClick={() => setPropagate((p) => !p)}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                  propagate ? "left-5" : "left-0.5"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Launch button */}
      <motion.button
        onClick={handleLaunch}
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
          loading
            ? "bg-cyber-border text-cyber-text-dim cursor-not-allowed"
            : "bg-cyber-red/10 text-cyber-red border-2 border-cyber-red/50 hover:bg-cyber-red/20 hover:border-cyber-red cyber-glow-red"
        }`}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 bg-cyber-red/10"
            animate={{ x: ["−100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-cyber-red border-t-transparent rounded-full animate-spin" />
              LAUNCHING ATTACK...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              LAUNCH {ATTACK_LABELS[selectedAttack].toUpperCase()} ATTACK
            </>
          )}
        </span>
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-cyber-red/10 border border-cyber-red/30 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
          <p className="text-xs text-cyber-red">{error}</p>
        </motion.div>
      )}

      {/* Recent sims */}
      {recentSims.length > 0 && (
        <div className="glass-panel rounded-xl p-4">
          <h3 className="text-xs font-semibold text-cyber-text-dim uppercase tracking-widest mb-3">
            Recent Simulations
          </h3>
          <div className="space-y-2">
            {recentSims.map((sim) => (
              <div
                key={sim.simulation_id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        sim.status === "running" ? "#00d4ff" : "#00ff88",
                    }}
                  />
                  <span className="text-cyber-text">{ATTACK_LABELS[sim.attack_type]}</span>
                </div>
                <span className={`font-mono ${sim.status === "running" ? "text-cyber-cyan" : "text-cyber-green"}`}>
                  {sim.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
