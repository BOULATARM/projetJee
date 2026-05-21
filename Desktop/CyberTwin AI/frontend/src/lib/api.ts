import type {
  NetworkTopology,
  SimulationResult,
  Alert,
  ThreatAnalysis,
  DashboardMetrics,
  AttackType,
  ChatMessage,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API = `${BASE_URL}/api/v1`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

export const networkApi = {
  getTopology: () => request<NetworkTopology>("/network/topology"),
  reset: () => request<{ status: string }>("/network/reset", { method: "POST" }),
  getNode: (id: string) => request(`/network/nodes/${id}`),
};

export const simulationApi = {
  start: (attackType: AttackType, options?: {
    source_node?: string;
    target_node?: string;
    intensity?: number;
    duration_seconds?: number;
    propagate?: boolean;
  }) =>
    request<{ simulation_id: string; status: string }>("/simulation/start", {
      method: "POST",
      body: JSON.stringify({
        attack_type: attackType,
        intensity: 0.7,
        duration_seconds: 30,
        propagate: true,
        ...options,
      }),
    }),
  getStatus: (id: string) => request<SimulationResult>(`/simulation/status/${id}`),
  getAttackTypes: () => request<{ value: AttackType; label: string }[]>("/simulation/attacks"),
  getAlerts: (limit?: number) =>
    request<Alert[]>(`/simulation/alerts${limit ? `?limit=${limit}` : ""}`),
  generateAlerts: (attackType: string, count?: number) =>
    request<Alert[]>(`/simulation/alerts/generate?attack_type=${attackType}&count=${count ?? 5}`, {
      method: "POST",
    }),
  acknowledgeAlert: (id: string) =>
    request(`/simulation/alerts/${id}`, { method: "DELETE" }),
  getMetrics: () => request<DashboardMetrics>("/simulation/metrics"),
};

export const aiApi = {
  analyze: (attackType: string, simulationId?: string) =>
    request<ThreatAnalysis>(
      `/ai/analyze?attack_type=${attackType}${simulationId ? `&simulation_id=${simulationId}` : ""}`,
      { method: "POST" }
    ),
  chat: (message: string, context?: Record<string, unknown>, history?: ChatMessage[]) =>
    request<{ response: string; model: string }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        context: context || {},
        history: (history || []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    }),
  predictNodeRisk: (nodeId: string) => request(`/ai/predict/${nodeId}`),
};
