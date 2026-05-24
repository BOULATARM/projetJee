"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const MITRE_TACTICS = [
  {
    id: "initial-access",
    tactic: "Initial Access",
    color: "#ff8c00",
    techniques: [
      { id: "T1190", name: "Exploit Public App", active: false },
      { id: "T1566", name: "Phishing", active: false },
      { id: "T1133", name: "External Remote", active: false },
    ],
  },
  {
    id: "execution",
    tactic: "Execution",
    color: "#ff6600",
    techniques: [
      { id: "T1059", name: "Command Script", active: false },
      { id: "T1204", name: "User Execution", active: false },
      { id: "T1203", name: "Client Exploit", active: false },
    ],
  },
  {
    id: "persistence",
    tactic: "Persistence",
    color: "#aa00ff",
    techniques: [
      { id: "T1098", name: "Account Manip.", active: false },
      { id: "T1136", name: "Create Account", active: false },
      { id: "T1053", name: "Scheduled Task", active: false },
    ],
  },
  {
    id: "privilege-escalation",
    tactic: "Priv. Escalation",
    color: "#cc00ff",
    techniques: [
      { id: "T1055", name: "Process Inject", active: false },
      { id: "T1068", name: "Exploit Vuln.", active: false },
      { id: "T1078", name: "Valid Accounts", active: false },
    ],
  },
  {
    id: "defense-evasion",
    tactic: "Defense Evasion",
    color: "#0088ff",
    techniques: [
      { id: "T1562", name: "Impair Defenses", active: false },
      { id: "T1027", name: "Obfuscated Files", active: false },
      { id: "T1070", name: "Clear Logs", active: false },
    ],
  },
  {
    id: "credential-access",
    tactic: "Credential Access",
    color: "#ff3333",
    techniques: [
      { id: "T1110", name: "Brute Force", active: false },
      { id: "T1552", name: "Unsecured Creds", active: false },
      { id: "T1003", name: "OS Credentials", active: false },
    ],
  },
  {
    id: "discovery",
    tactic: "Discovery",
    color: "#00d4ff",
    techniques: [
      { id: "T1046", name: "Network Scan", active: false },
      { id: "T1082", name: "System Info", active: false },
      { id: "T1083", name: "File Discovery", active: false },
    ],
  },
  {
    id: "lateral-movement",
    tactic: "Lateral Movement",
    color: "#ff8800",
    techniques: [
      { id: "T1021", name: "Remote Services", active: false },
      { id: "T1534", name: "Internal Spear", active: false },
      { id: "T1557", name: "MITM", active: false },
    ],
  },
  {
    id: "collection",
    tactic: "Collection",
    color: "#ffcc00",
    techniques: [
      { id: "T1005", name: "Local Data", active: false },
      { id: "T1039", name: "Network Drive", active: false },
      { id: "T1113", name: "Screen Capture", active: false },
    ],
  },
  {
    id: "impact",
    tactic: "Impact",
    color: "#ff0033",
    techniques: [
      { id: "T1486", name: "Ransomware", active: false },
      { id: "T1498", name: "DDoS", active: false },
      { id: "T1490", name: "Inhibit Recovery", active: false },
    ],
  },
];

interface MitreMapProps {
  activeTechniques?: string[];
}

export default function MitreMap({ activeTechniques = [] }: MitreMapProps) {
  const activeSet = new Set(activeTechniques);

  const tactics = MITRE_TACTICS.map((tactic) => ({
    ...tactic,
    techniques: tactic.techniques.map((t) => ({
      ...t,
      active: activeSet.has(t.id),
    })),
  }));

  const activeCount = tactics.reduce(
    (sum, t) => sum + t.techniques.filter((tech) => tech.active).length,
    0
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyber-cyan" />
          <h2 className="text-sm font-semibold text-cyber-text">MITRE ATT&CK Matrix</h2>
        </div>
        <div className="text-xs text-cyber-text-dim">
          {activeCount} techniques detected
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {tactics.map((tactic, ti) => (
            <div key={tactic.id} className="w-28">
              {/* Tactic header */}
              <div
                className="text-xs font-bold text-center py-1.5 px-1 rounded-t-lg mb-1 leading-tight"
                style={{ backgroundColor: `${tactic.color}20`, color: tactic.color }}
              >
                {tactic.tactic}
              </div>

              {/* Techniques */}
              <div className="space-y-1">
                {tactic.techniques.map((tech, techI) => (
                  <motion.div
                    key={tech.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ti * 0.05 + techI * 0.02 }}
                    className={`p-1.5 rounded text-center cursor-default transition-all relative overflow-hidden ${
                      tech.active
                        ? "border-2"
                        : "border border-cyber-border/30 opacity-50"
                    }`}
                    style={
                      tech.active
                        ? {
                            borderColor: tactic.color,
                            backgroundColor: `${tactic.color}15`,
                            boxShadow: `0 0 10px ${tactic.color}30`,
                          }
                        : { backgroundColor: "rgba(5,26,46,0.5)" }
                    }
                  >
                    {tech.active && (
                      <motion.div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundColor: tactic.color }}
                        animate={{ opacity: [0.1, 0.25, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <p
                      className="text-xs font-mono leading-none relative z-10"
                      style={{ color: tech.active ? tactic.color : "#4a7a9b", fontSize: "10px" }}
                    >
                      {tech.id}
                    </p>
                    <p
                      className="text-xs leading-tight mt-0.5 relative z-10"
                      style={{ color: tech.active ? "#a8d8ea" : "#2a4a6a", fontSize: "9px" }}
                    >
                      {tech.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-cyber-border text-xs text-cyber-text-dim">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-cyber-red bg-cyber-red/20" />
          <span>Active/Detected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-cyber-border/30 bg-cyber-panel/50 opacity-50" />
          <span>Not detected</span>
        </div>
      </div>
    </div>
  );
}
