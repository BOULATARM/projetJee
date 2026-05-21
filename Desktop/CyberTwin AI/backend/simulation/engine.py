import asyncio
import random
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Callable
import networkx as nx

from api.models.schemas import (
    NetworkNode, NetworkEdge, NetworkTopology, AttackEvent,
    AttackType, NodeStatus, NodeType, SeverityLevel, SimulationResult
)

MITRE_MAPPING = {
    AttackType.BRUTE_FORCE: "T1110",
    AttackType.SQL_INJECTION: "T1190",
    AttackType.XSS: "T1059.007",
    AttackType.DDOS: "T1498",
    AttackType.RANSOMWARE: "T1486",
    AttackType.PHISHING: "T1566",
    AttackType.MALWARE: "T1204",
    AttackType.LATERAL_MOVEMENT: "T1021",
    AttackType.CREDENTIAL_STUFFING: "T1110.004",
    AttackType.PORT_SCAN: "T1046",
    AttackType.ZERO_DAY: "T1203",
    AttackType.MAN_IN_THE_MIDDLE: "T1557",
}

ATTACK_DESCRIPTIONS = {
    AttackType.BRUTE_FORCE: "Automated credential brute-force attack detected on authentication service",
    AttackType.SQL_INJECTION: "SQL injection payload injected into web application database query",
    AttackType.XSS: "Cross-site scripting payload executed in victim browser session",
    AttackType.DDOS: "Distributed denial-of-service flood overwhelming network bandwidth",
    AttackType.RANSOMWARE: "Ransomware encrypting files and spreading via SMB shares",
    AttackType.PHISHING: "Spear-phishing email with malicious attachment opened by user",
    AttackType.MALWARE: "Malware dropper executed, establishing C2 communication channel",
    AttackType.LATERAL_MOVEMENT: "Attacker moving laterally using stolen credentials and pass-the-hash",
    AttackType.CREDENTIAL_STUFFING: "Stolen credential database used for account takeover attempts",
    AttackType.PORT_SCAN: "Stealth port scan mapping network services and open ports",
    AttackType.ZERO_DAY: "Zero-day exploit targeting unpatched vulnerability in target service",
    AttackType.MAN_IN_THE_MIDDLE: "ARP poisoning enabling man-in-the-middle interception of traffic",
}


def generate_default_topology() -> NetworkTopology:
    nodes = [
        NetworkNode(id="fw-01", label="Main Firewall", type=NodeType.FIREWALL,
                    ip="192.168.0.1", services=["iptables", "IDS"],
                    position={"x": 0, "y": 0, "z": 0}),
        NetworkNode(id="router-01", label="Core Router", type=NodeType.ROUTER,
                    ip="192.168.0.2", services=["BGP", "OSPF"],
                    position={"x": 200, "y": 0, "z": 0}),
        NetworkNode(id="web-01", label="Web Server", type=NodeType.SERVER,
                    ip="192.168.1.10", os="Ubuntu 22.04",
                    services=["nginx", "Node.js", "SSL"],
                    position={"x": 400, "y": 150, "z": 0}),
        NetworkNode(id="db-01", label="Database Server", type=NodeType.DATABASE,
                    ip="192.168.1.20", os="Ubuntu 22.04",
                    services=["PostgreSQL", "Redis"],
                    position={"x": 400, "y": -150, "z": 0}),
        NetworkNode(id="auth-01", label="Auth Service", type=NodeType.API,
                    ip="192.168.1.30", os="Alpine Linux",
                    services=["JWT", "OAuth2", "LDAP"],
                    position={"x": 600, "y": 100, "z": 0}),
        NetworkNode(id="api-01", label="API Gateway", type=NodeType.API,
                    ip="192.168.1.40", os="Alpine Linux",
                    services=["REST API", "GraphQL", "gRPC"],
                    position={"x": 600, "y": -100, "z": 0}),
        NetworkNode(id="ws-01", label="Workstation 01", type=NodeType.WORKSTATION,
                    ip="192.168.2.10", os="Windows 11",
                    services=["RDP", "SMB"],
                    position={"x": 800, "y": 200, "z": 0}),
        NetworkNode(id="ws-02", label="Workstation 02", type=NodeType.WORKSTATION,
                    ip="192.168.2.11", os="Windows 11",
                    services=["RDP", "SMB"],
                    position={"x": 800, "y": 50, "z": 0}),
        NetworkNode(id="ws-03", label="Workstation 03", type=NodeType.WORKSTATION,
                    ip="192.168.2.12", os="macOS 14",
                    services=["SSH", "VPN"],
                    position={"x": 800, "y": -100, "z": 0}),
        NetworkNode(id="cloud-01", label="AWS Instance", type=NodeType.CLOUD,
                    ip="10.0.1.100", os="Amazon Linux 2",
                    services=["S3", "EC2", "Lambda"],
                    position={"x": 1000, "y": 150, "z": 0}),
        NetworkNode(id="cloud-02", label="Azure VM", type=NodeType.CLOUD,
                    ip="10.0.1.101", os="Windows Server 2022",
                    services=["Azure AD", "Blob Storage"],
                    position={"x": 1000, "y": -150, "z": 0}),
        NetworkNode(id="iot-01", label="IoT Sensor Hub", type=NodeType.IOT,
                    ip="192.168.3.10", os="FreeRTOS",
                    services=["MQTT", "CoAP"],
                    position={"x": -200, "y": 150, "z": 0}),
    ]

    edges = [
        NetworkEdge(id="e1", source="fw-01", target="router-01", protocol="TCP", encrypted=True),
        NetworkEdge(id="e2", source="router-01", target="web-01", protocol="HTTP/HTTPS", port=443, encrypted=True),
        NetworkEdge(id="e3", source="router-01", target="db-01", protocol="TCP", port=5432),
        NetworkEdge(id="e4", source="web-01", target="auth-01", protocol="HTTPS", port=443, encrypted=True),
        NetworkEdge(id="e5", source="web-01", target="api-01", protocol="gRPC", port=50051, encrypted=True),
        NetworkEdge(id="e6", source="api-01", target="db-01", protocol="TCP", port=5432),
        NetworkEdge(id="e7", source="auth-01", target="db-01", protocol="TCP", port=5432),
        NetworkEdge(id="e8", source="ws-01", target="router-01", protocol="TCP"),
        NetworkEdge(id="e9", source="ws-02", target="router-01", protocol="TCP"),
        NetworkEdge(id="e10", source="ws-03", target="router-01", protocol="TCP"),
        NetworkEdge(id="e11", source="api-01", target="cloud-01", protocol="HTTPS", port=443, encrypted=True),
        NetworkEdge(id="e12", source="cloud-01", target="cloud-02", protocol="Azure Peering", encrypted=True),
        NetworkEdge(id="e13", source="iot-01", target="fw-01", protocol="MQTT", port=1883),
        NetworkEdge(id="e14", source="ws-01", target="ws-02", protocol="SMB", port=445),
        NetworkEdge(id="e15", source="ws-02", target="ws-03", protocol="SMB", port=445),
    ]

    return NetworkTopology(nodes=nodes, edges=edges)


class SimulationEngine:
    def __init__(self):
        self.topology = generate_default_topology()
        self.graph = self._build_graph()
        self.active_simulations: Dict[str, SimulationResult] = {}
        self.event_callbacks: List[Callable] = []
        self.node_states: Dict[str, NodeStatus] = {n.id: NodeStatus.SAFE for n in self.topology.nodes}

    def _build_graph(self) -> nx.Graph:
        G = nx.Graph()
        for node in self.topology.nodes:
            G.add_node(node.id, **node.model_dump())
        for edge in self.topology.edges:
            G.add_edge(edge.source, edge.target, **edge.model_dump())
        return G

    def register_callback(self, callback: Callable):
        self.event_callbacks.append(callback)

    async def _emit_event(self, event_type: str, data: dict):
        for callback in self.event_callbacks:
            try:
                await callback(event_type, data)
            except Exception:
                pass

    def get_topology(self) -> NetworkTopology:
        for node in self.topology.nodes:
            node.status = self.node_states.get(node.id, NodeStatus.SAFE)
        return self.topology

    def reset_topology(self):
        self.node_states = {n.id: NodeStatus.SAFE for n in self.topology.nodes}

    def _get_propagation_targets(self, node_id: str, attack_type: AttackType) -> List[str]:
        if node_id not in self.graph:
            return []
        neighbors = list(self.graph.neighbors(node_id))

        if attack_type == AttackType.RANSOMWARE:
            smb_neighbors = [n for n in neighbors if any(
                e.get("protocol") == "SMB"
                for e in [self.graph.edges[node_id, n]]
                if "protocol" in e
            )]
            return smb_neighbors if smb_neighbors else neighbors[:2]
        elif attack_type == AttackType.LATERAL_MOVEMENT:
            return neighbors[:3]
        elif attack_type == AttackType.DDOS:
            return neighbors[:1]
        elif attack_type == AttackType.MALWARE:
            return neighbors[:2]
        else:
            return neighbors[:2]

    async def run_simulation(self, sim_request) -> SimulationResult:
        sim_id = str(uuid.uuid4())[:8]

        all_node_ids = [n.id for n in self.topology.nodes]
        source = sim_request.source_node or random.choice([
            n.id for n in self.topology.nodes
            if n.type in [NodeType.WORKSTATION, NodeType.IOT]
        ])
        target = sim_request.target_node or random.choice([
            n.id for n in self.topology.nodes
            if n.id != source and n.type in [NodeType.SERVER, NodeType.DATABASE, NodeType.API]
        ])

        result = SimulationResult(
            simulation_id=sim_id,
            attack_type=sim_request.attack_type,
            start_time=datetime.now(),
            status="running"
        )
        self.active_simulations[sim_id] = result

        asyncio.create_task(self._execute_simulation(sim_id, sim_request, source, target))
        return result

    async def _execute_simulation(self, sim_id: str, sim_request, source: str, target: str):
        result = self.active_simulations[sim_id]
        attack_type = sim_request.attack_type

        await self._emit_event("simulation_started", {
            "simulation_id": sim_id,
            "attack_type": attack_type.value,
            "source": source,
            "target": target
        })

        self.node_states[source] = NodeStatus.SUSPICIOUS
        await self._emit_event("node_status_changed", {
            "node_id": source,
            "status": NodeStatus.SUSPICIOUS.value,
            "simulation_id": sim_id
        })
        await asyncio.sleep(1.5)

        initial_event = AttackEvent(
            id=str(uuid.uuid4())[:8],
            attack_type=attack_type,
            source_node="external",
            target_node=source,
            timestamp=datetime.now(),
            severity=SeverityLevel.MEDIUM,
            success=True,
            mitre_technique=MITRE_MAPPING.get(attack_type),
            description=f"Initial compromise: {ATTACK_DESCRIPTIONS.get(attack_type, '')}"
        )
        result.events.append(initial_event)
        await self._emit_event("attack_event", initial_event.model_dump(mode="json"))

        self.node_states[source] = NodeStatus.COMPROMISED
        result.compromised_nodes.append(source)
        await self._emit_event("node_status_changed", {
            "node_id": source,
            "status": NodeStatus.COMPROMISED.value,
            "simulation_id": sim_id
        })

        if sim_request.propagate:
            await self._propagate_attack(sim_id, source, target, attack_type, sim_request.intensity, depth=0)

        result.status = "completed"
        result.total_damage_score = len(result.compromised_nodes) * 25.0 * sim_request.intensity

        await self._emit_event("simulation_completed", {
            "simulation_id": sim_id,
            "compromised_nodes": result.compromised_nodes,
            "total_damage_score": result.total_damage_score,
            "event_count": len(result.events)
        })

    async def _propagate_attack(self, sim_id: str, current_node: str, target: str,
                                 attack_type: AttackType, intensity: float, depth: int):
        if depth > 4:
            return

        result = self.active_simulations[sim_id]
        await asyncio.sleep(random.uniform(1.0, 3.0))

        targets = self._get_propagation_targets(current_node, attack_type)

        if target not in [n.id for n in self.topology.nodes]:
            target = targets[0] if targets else current_node

        spread_targets = targets[:max(1, int(len(targets) * intensity))]

        for next_node in spread_targets:
            if next_node in result.compromised_nodes:
                continue

            severity = SeverityLevel.HIGH if depth == 0 else (
                SeverityLevel.CRITICAL if depth == 1 else SeverityLevel.MEDIUM
            )

            event = AttackEvent(
                id=str(uuid.uuid4())[:8],
                attack_type=attack_type,
                source_node=current_node,
                target_node=next_node,
                timestamp=datetime.now(),
                severity=severity,
                success=random.random() > 0.2,
                mitre_technique=MITRE_MAPPING.get(attack_type),
                description=f"Propagation from {current_node} to {next_node}: {ATTACK_DESCRIPTIONS.get(attack_type, '')}"
            )
            result.events.append(event)
            await self._emit_event("attack_event", event.model_dump(mode="json"))

            if event.success:
                new_status = NodeStatus.CRITICAL if depth == 0 else NodeStatus.COMPROMISED
                self.node_states[next_node] = new_status
                result.compromised_nodes.append(next_node)
                await self._emit_event("node_status_changed", {
                    "node_id": next_node,
                    "status": new_status.value,
                    "simulation_id": sim_id
                })

                if attack_type in [AttackType.RANSOMWARE, AttackType.MALWARE, AttackType.LATERAL_MOVEMENT]:
                    await self._propagate_attack(sim_id, next_node, target, attack_type, intensity * 0.7, depth + 1)

            await asyncio.sleep(random.uniform(0.5, 1.5))

    def get_simulation_status(self, sim_id: str) -> Optional[SimulationResult]:
        return self.active_simulations.get(sim_id)

    def predict_next_targets(self, compromised_nodes: List[str]) -> List[str]:
        predicted = set()
        for node_id in compromised_nodes:
            if node_id in self.graph:
                neighbors = self.graph.neighbors(node_id)
                for n in neighbors:
                    if n not in compromised_nodes:
                        predicted.add(n)
        return list(predicted)[:5]


simulation_engine = SimulationEngine()
