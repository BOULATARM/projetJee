"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useLang } from "@/context/LanguageContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatsCards from "@/components/dashboard/StatsCards";
import AttackChart from "@/components/dashboard/AttackChart";
import ThreatGauge from "@/components/dashboard/ThreatGauge";
import AttackSimulator from "@/components/simulation/AttackSimulator";
import AlertCenter from "@/components/alerts/AlertCenter";
import AIChat from "@/components/ai/AIChat";
import ThreatAnalysisPanel from "@/components/ai/ThreatAnalysis";
import AttackTimeline from "@/components/timeline/AttackTimeline";
import MitreMap from "@/components/mitre/MitreMap";
import ThreatHeatmap from "@/components/heatmap/ThreatHeatmap";
import NodeInfoPanel from "@/components/network/NodeInfoPanel";
import CveIntelligence from "@/components/cve/CveIntelligence";
import { useWebSocket } from "@/hooks/useWebSocket";
import { networkApi, simulationApi } from "@/lib/api";
import type {
  NetworkNode,
  NetworkEdge,
  AttackEvent,
  SimulationResult,
  DashboardMetrics,
  AttackType,
  NetworkTopology,
  WSMessage,
} from "@/types";

const NetworkGraph3D = dynamic(
  () => import("@/components/network/NetworkGraph3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-cyber-bg rounded-xl">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-cyber-text-dim">Loading 3D Network...</p>
        </div>
      </div>
    ),
  }
);

const DEFAULT_METRICS: DashboardMetrics = {
  total_attacks: 0,
  active_threats: 0,
  compromised_nodes: 0,
  threat_score: 0,
  attacks_blocked: 0,
  network_health: 100,
  top_attack_types: [],
  recent_alerts: [],
  attack_timeline: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    attacks: 0,
    blocked: 0,
  })),
};

export default function Home() {
  const { t } = useLang();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [topology, setTopology] = useState<NetworkTopology>({ nodes: [], edges: [] });
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_METRICS);
  const [events, setEvents] = useState<AttackEvent[]>([]);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [activeEdgeIds, setActiveEdgeIds] = useState<Set<string>>(new Set());
  const [currentAttack, setCurrentAttack] = useState<AttackType | null>(null);
  const [currentSimId, setCurrentSimId] = useState<string | null>(null);
  const [compromisedNodes, setCompromisedNodes] = useState<string[]>([]);
  const [activeMitre, setActiveMitre] = useState<string[]>([]);
  const metricsTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const handleWSMessage = useCallback((msg: WSMessage) => {
    if (msg.type === "topology_update") {
      const topo = msg.data as NetworkTopology;
      setTopology(topo);
    } else if (msg.type === "node_status_changed") {
      const d = msg.data as { node_id: string; status: string };
      setTopology((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === d.node_id ? { ...n, status: d.status as NetworkNode["status"] } : n
        ),
      }));
    } else if (msg.type === "attack_event") {
      const event = msg.data as AttackEvent;
      setEvents((prev) => [event, ...prev].slice(0, 200));
      if (event.mitre_technique) {
        setActiveMitre((prev) =>
          prev.includes(event.mitre_technique!) ? prev : [...prev, event.mitre_technique!]
        );
      }
      const edgeId = `e-${event.source_node}-${event.target_node}`;
      setActiveEdgeIds((prev) => {
        const next = new Set(prev);
        next.add(edgeId);
        setTimeout(() => {
          setActiveEdgeIds((cur) => {
            const updated = new Set(cur);
            updated.delete(edgeId);
            return updated;
          });
        }, 4000);
        return next;
      });
    } else if (msg.type === "simulation_completed") {
      const d = msg.data as { compromised_nodes: string[] };
      setCompromisedNodes(d.compromised_nodes || []);
      fetchTopology();
    }
  }, []);

  const { connected, nodeStatuses } = useWebSocket(handleWSMessage);

  const fetchTopology = useCallback(async () => {
    try {
      const topo = await networkApi.getTopology();
      setTopology(topo);
    } catch {}
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const m = await simulationApi.getMetrics();
      setMetrics(m);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTopology();
    fetchMetrics();
    metricsTimer.current = setInterval(fetchMetrics, 8000);
    return () => clearInterval(metricsTimer.current);
  }, [fetchTopology, fetchMetrics]);

  useEffect(() => {
    if (Object.keys(nodeStatuses).length === 0) return;
    setTopology((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        nodeStatuses[n.id] ? { ...n, status: nodeStatuses[n.id] as NetworkNode["status"] } : n
      ),
    }));
    const compromised = Object.entries(nodeStatuses)
      .filter(([, s]) => s === "compromised" || s === "critical")
      .map(([id]) => id);
    setCompromisedNodes(compromised);
  }, [nodeStatuses]);

  const handleReset = async () => {
    try {
      await networkApi.reset();
      await fetchTopology();
      setEvents([]);
      setActiveEdgeIds(new Set());
      setCompromisedNodes([]);
      setActiveMitre([]);
      setCurrentAttack(null);
      setCurrentSimId(null);
      setMetrics(DEFAULT_METRICS);
    } catch {}
  };

  const handleSimulationStart = (result: SimulationResult) => {
    setCurrentAttack(result.attack_type);
    setCurrentSimId(result.simulation_id);
    fetchMetrics();
  };

  const sections: Record<string, React.ReactNode> = {
    dashboard: (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold text-cyber-text mb-1">
            {t.dashboard}
          </h1>
          <p className="text-sm text-cyber-text-dim">
            {t.system} — {t.threatLevel}
          </p>
        </div>
        <StatsCards metrics={metrics} />
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <AttackChart
              timeline={metrics.attack_timeline}
              topAttacks={metrics.top_attack_types}
            />
          </div>
          <ThreatGauge score={metrics.threat_score} />
        </div>
        <div className="glass-panel rounded-xl p-5">
          <h3 className="text-sm font-semibold text-cyber-text mb-3">Live Event Feed</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {events.slice(0, 10).map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-xs py-1.5 border-b border-cyber-border/30"
              >
                <span className="text-cyber-text-dim font-mono">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className="font-bold uppercase"
                  style={{
                    color:
                      e.severity === "critical"
                        ? "#ff3333"
                        : e.severity === "high"
                        ? "#ff8c00"
                        : e.severity === "medium"
                        ? "#ffcc00"
                        : "#00ff88",
                  }}
                >
                  {e.severity}
                </span>
                <span className="text-cyber-text truncate">{e.description}</span>
                {e.mitre_technique && (
                  <span className="ml-auto text-cyber-cyan font-mono shrink-0">
                    {e.mitre_technique}
                  </span>
                )}
              </motion.div>
            ))}
            {events.length === 0 && (
              <p className="text-xs text-cyber-text-dim text-center py-4">
                No events — launch a simulation to see live data
              </p>
            )}
          </div>
        </div>
      </div>
    ),

    network: (
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-cyber-text">{t.network}</h1>
          <div className="flex items-center gap-2 text-xs text-cyber-text-dim">
            <span>{topology.nodes.length} nodes</span>
            <span>·</span>
            <span>{topology.edges.length} connections</span>
          </div>
        </div>
        <div className="relative flex-1 min-h-[500px]">
          <NetworkGraph3D
            nodes={topology.nodes}
            edges={topology.edges}
            activeEdgeIds={activeEdgeIds}
            onNodeClick={setSelectedNode}
            selectedNodeId={selectedNode?.id}
          />
          <NodeInfoPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
      </div>
    ),

    simulation: (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <h1 className="text-lg font-bold text-cyber-text">{t.simulation}</h1>
          <AttackSimulator onSimulationStart={handleSimulationStart} />
          <CveIntelligence
            attackType={currentAttack ?? "malware"}
            autoFetch={true}
          />
        </div>
        <div className="xl:col-span-2 space-y-4">
          <ThreatAnalysisPanel
            attackType={currentAttack}
            simulationId={currentSimId || undefined}
            compromisedNodes={compromisedNodes}
          />
          <div className="glass-panel rounded-xl p-5 h-80 overflow-y-auto">
            <AttackTimeline events={events} />
          </div>
        </div>
      </div>
    ),

    alerts: (
      <div className="h-full flex flex-col">
        <h1 className="text-lg font-bold text-cyber-text mb-4">{t.alertCenter}</h1>
        <div className="glass-panel rounded-xl p-5 flex-1">
          <AlertCenter externalAlerts={metrics.recent_alerts} />
        </div>
      </div>
    ),

    timeline: (
      <div className="h-full flex flex-col">
        <h1 className="text-lg font-bold text-cyber-text mb-4">{t.timeline}</h1>
        <div className="glass-panel rounded-xl p-5 flex-1">
          <AttackTimeline events={events} />
        </div>
      </div>
    ),

    heatmap: (
      <div className="h-full flex flex-col">
        <h1 className="text-lg font-bold text-cyber-text mb-4">{t.heatmap}</h1>
        <div className="glass-panel rounded-xl p-5 flex-1">
          <ThreatHeatmap nodes={topology.nodes} />
        </div>
      </div>
    ),

    mitre: (
      <div className="h-full flex flex-col">
        <h1 className="text-lg font-bold text-cyber-text mb-4">{t.mitre}</h1>
        <div className="glass-panel rounded-xl p-5 flex-1 overflow-hidden">
          <MitreMap activeTechniques={activeMitre} />
        </div>
      </div>
    ),

    "ai-chat": (
      <div className="h-full flex flex-col">
        <h1 className="text-lg font-bold text-cyber-text mb-4">{t.aiAnalyst}</h1>
        <div className="glass-panel rounded-xl p-5 flex-1 overflow-hidden flex flex-col">
          <AIChat
            currentAttackType={currentAttack}
            compromisedNodes={compromisedNodes}
            threatScore={metrics.threat_score}
          />
        </div>
      </div>
    ),
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          connected={connected}
          threatScore={metrics.threat_score}
          alertCount={metrics.recent_alerts.filter((a) => !a.acknowledged).length}
          alerts={metrics.recent_alerts}
          onReset={handleReset}
          onAcknowledge={async (id) => {
            try {
              await simulationApi.acknowledgeAlert(id);
              fetchMetrics();
            } catch {}
          }}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`h-full ${activeSection === "network" ? "flex flex-col" : ""}`}
            >
              {sections[activeSection] ?? (
                <div className="text-cyber-text-dim text-center py-20">
                  Section not found
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
