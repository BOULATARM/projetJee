"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WSMessage, NetworkNode, AttackEvent } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

interface WSState {
  connected: boolean;
  nodeStatuses: Record<string, string>;
  latestEvents: AttackEvent[];
  activeSimulations: string[];
}

export function useWebSocket(onMessage?: (msg: WSMessage) => void) {
  const ws = useRef<WebSocket | null>(null);
  const [state, setState] = useState<WSState>({
    connected: false,
    nodeStatuses: {},
    latestEvents: [],
    activeSimulations: [],
  });

  const send = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let pingTimer: ReturnType<typeof setInterval>;

    function connect() {
      try {
        const socket = new WebSocket(WS_URL);
        ws.current = socket;

        socket.onopen = () => {
          setState((s) => ({ ...s, connected: true }));
          pingTimer = setInterval(() => send({ type: "ping" }), 25000);
        };

        socket.onclose = () => {
          setState((s) => ({ ...s, connected: false }));
          clearInterval(pingTimer);
          reconnectTimer = setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          socket.close();
        };

        socket.onmessage = (event) => {
          try {
            const msg: WSMessage = JSON.parse(event.data);
            onMessage?.(msg);

            if (msg.type === "node_status_changed") {
              const d = msg.data as { node_id: string; status: string };
              setState((s) => ({
                ...s,
                nodeStatuses: { ...s.nodeStatuses, [d.node_id]: d.status },
              }));
            } else if (msg.type === "attack_event") {
              const event = msg.data as AttackEvent;
              setState((s) => ({
                ...s,
                latestEvents: [event, ...s.latestEvents].slice(0, 100),
              }));
            } else if (msg.type === "simulation_started") {
              const d = msg.data as { simulation_id: string };
              setState((s) => ({
                ...s,
                activeSimulations: [...s.activeSimulations, d.simulation_id],
              }));
            } else if (msg.type === "simulation_completed") {
              const d = msg.data as { simulation_id: string };
              setState((s) => ({
                ...s,
                activeSimulations: s.activeSimulations.filter(
                  (id) => id !== d.simulation_id
                ),
              }));
            }
          } catch {
            // ignore malformed messages
          }
        };
      } catch {
        reconnectTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      clearInterval(pingTimer);
      ws.current?.close();
    };
  }, [send, onMessage]);

  return { ...state, send };
}
