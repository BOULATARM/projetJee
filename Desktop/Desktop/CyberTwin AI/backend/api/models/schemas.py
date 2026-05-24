from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


class NodeStatus(str, Enum):
    SAFE = "safe"
    SUSPICIOUS = "suspicious"
    COMPROMISED = "compromised"
    CRITICAL = "critical"
    OFFLINE = "offline"


class NodeType(str, Enum):
    SERVER = "server"
    WORKSTATION = "workstation"
    ROUTER = "router"
    DATABASE = "database"
    FIREWALL = "firewall"
    API = "api"
    CLOUD = "cloud"
    IOT = "iot"


class AttackType(str, Enum):
    SQL_INJECTION = "sql_injection"
    XSS = "xss"
    BRUTE_FORCE = "brute_force"
    DDOS = "ddos"
    RANSOMWARE = "ransomware"
    PHISHING = "phishing"
    MALWARE = "malware"
    LATERAL_MOVEMENT = "lateral_movement"
    CREDENTIAL_STUFFING = "credential_stuffing"
    PORT_SCAN = "port_scan"
    ZERO_DAY = "zero_day"
    MAN_IN_THE_MIDDLE = "man_in_the_middle"


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class NetworkNode(BaseModel):
    id: str
    label: str
    type: NodeType
    status: NodeStatus = NodeStatus.SAFE
    ip: str
    os: Optional[str] = None
    services: List[str] = []
    risk_score: float = 0.0
    position: Dict[str, float] = {"x": 0, "y": 0, "z": 0}
    metadata: Dict[str, Any] = {}


class NetworkEdge(BaseModel):
    id: str
    source: str
    target: str
    protocol: str = "TCP"
    port: Optional[int] = None
    encrypted: bool = False
    bandwidth: float = 0.0


class NetworkTopology(BaseModel):
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]


class AttackEvent(BaseModel):
    id: str
    attack_type: AttackType
    source_node: str
    target_node: str
    timestamp: datetime
    severity: SeverityLevel
    success: bool = False
    payload: Optional[str] = None
    mitre_technique: Optional[str] = None
    description: str = ""


class SimulationRequest(BaseModel):
    attack_type: AttackType
    source_node: Optional[str] = None
    target_node: Optional[str] = None
    intensity: float = 0.5
    duration_seconds: int = 30
    propagate: bool = True


class SimulationResult(BaseModel):
    simulation_id: str
    attack_type: AttackType
    start_time: datetime
    events: List[AttackEvent] = []
    compromised_nodes: List[str] = []
    total_damage_score: float = 0.0
    status: str = "running"


class Alert(BaseModel):
    id: str
    title: str
    description: str
    severity: SeverityLevel
    timestamp: datetime
    node_id: Optional[str] = None
    attack_type: Optional[AttackType] = None
    acknowledged: bool = False
    mitre_technique: Optional[str] = None


class ThreatAnalysis(BaseModel):
    attack_type: str
    risk_level: str
    affected_nodes: List[str]
    propagation_paths: List[List[str]]
    mitre_techniques: List[str]
    recommendations: List[str]
    summary: str
    confidence_score: float
    predicted_next_targets: List[str]


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    history: List[ChatMessage] = []


class DashboardMetrics(BaseModel):
    total_attacks: int
    active_threats: int
    compromised_nodes: int
    threat_score: float
    attacks_blocked: int
    network_health: float
    top_attack_types: List[Dict[str, Any]]
    recent_alerts: List[Alert]
    attack_timeline: List[Dict[str, Any]]
