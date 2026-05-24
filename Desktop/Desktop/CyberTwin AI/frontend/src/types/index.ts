export type NodeStatus = "safe" | "suspicious" | "compromised" | "critical" | "offline";

export type NodeType =
  | "server"
  | "workstation"
  | "router"
  | "database"
  | "firewall"
  | "api"
  | "cloud"
  | "iot";

export type AttackType =
  | "sql_injection"
  | "xss"
  | "brute_force"
  | "ddos"
  | "ransomware"
  | "phishing"
  | "malware"
  | "lateral_movement"
  | "credential_stuffing"
  | "port_scan"
  | "zero_day"
  | "man_in_the_middle";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export interface NetworkNode {
  id: string;
  label: string;
  type: NodeType;
  status: NodeStatus;
  ip: string;
  os?: string;
  services: string[];
  risk_score: number;
  position: { x: number; y: number; z: number };
  metadata: Record<string, unknown>;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  protocol: string;
  port?: number;
  encrypted: boolean;
  bandwidth: number;
}

export interface NetworkTopology {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface AttackEvent {
  id: string;
  attack_type: AttackType;
  source_node: string;
  target_node: string;
  timestamp: string;
  severity: SeverityLevel;
  success: boolean;
  payload?: string;
  mitre_technique?: string;
  description: string;
}

export interface SimulationResult {
  simulation_id: string;
  attack_type: AttackType;
  start_time: string;
  events: AttackEvent[];
  compromised_nodes: string[];
  total_damage_score: number;
  status: "running" | "completed" | "failed";
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  timestamp: string;
  node_id?: string;
  attack_type?: AttackType;
  acknowledged: boolean;
  mitre_technique?: string;
}

export interface ThreatAnalysis {
  attack_type: string;
  risk_level: string;
  affected_nodes: string[];
  propagation_paths: string[][];
  mitre_techniques: string[];
  recommendations: string[];
  summary: string;
  confidence_score: number;
  predicted_next_targets: string[];
}

export interface DashboardMetrics {
  total_attacks: number;
  active_threats: number;
  compromised_nodes: number;
  threat_score: number;
  attacks_blocked: number;
  network_health: number;
  top_attack_types: { type: string; count: number }[];
  recent_alerts: Alert[];
  attack_timeline: { hour: string; attacks: number; blocked: number }[];
}

export interface WSMessage {
  type:
    | "simulation_started"
    | "simulation_completed"
    | "attack_event"
    | "node_status_changed"
    | "topology_update"
    | "heartbeat"
    | "pong";
  data: unknown;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const STATUS_COLORS: Record<NodeStatus, string> = {
  safe: "#00ff88",
  suspicious: "#ffcc00",
  compromised: "#ff6600",
  critical: "#ff3333",
  offline: "#4a7a9b",
};

export const STATUS_LABELS: Record<NodeStatus, string> = {
  safe: "Safe",
  suspicious: "Suspicious",
  compromised: "Compromised",
  critical: "Critical",
  offline: "Offline",
};

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  low: "#00ff88",
  medium: "#ffcc00",
  high: "#ff8c00",
  critical: "#ff3333",
};

export const NODE_TYPE_ICONS: Record<NodeType, string> = {
  server: "🖥️",
  workstation: "💻",
  router: "🔀",
  database: "🗄️",
  firewall: "🛡️",
  api: "⚡",
  cloud: "☁️",
  iot: "📡",
};

export const ATTACK_LABELS: Record<AttackType, string> = {
  sql_injection: "SQL Injection",
  xss: "XSS",
  brute_force: "Brute Force",
  ddos: "DDoS",
  ransomware: "Ransomware",
  phishing: "Phishing",
  malware: "Malware",
  lateral_movement: "Lateral Movement",
  credential_stuffing: "Credential Stuffing",
  port_scan: "Port Scan",
  zero_day: "Zero-Day",
  man_in_the_middle: "Man-in-the-Middle",
};
