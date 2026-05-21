import uuid
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from typing import List

from simulation.engine import simulation_engine
from api.models.schemas import SimulationRequest, AttackType, SeverityLevel, Alert

router = APIRouter(prefix="/simulation", tags=["simulation"])

_alerts: List[Alert] = []


def generate_sample_alerts(attack_type: str, compromised_nodes: List[str]) -> List[Alert]:
    alerts = []
    severities = [SeverityLevel.HIGH, SeverityLevel.CRITICAL, SeverityLevel.MEDIUM]
    titles = [
        f"{attack_type.replace('_', ' ').title()} Attack Detected",
        "Lateral Movement Detected",
        "Suspicious Authentication Activity",
        "Anomalous Network Traffic",
        "Privilege Escalation Attempt",
    ]
    for i, node in enumerate(compromised_nodes[:5]):
        alert = Alert(
            id=str(uuid.uuid4())[:8],
            title=titles[i % len(titles)],
            description=f"Security incident detected on node {node}. Immediate investigation required.",
            severity=severities[i % len(severities)],
            timestamp=datetime.now() - timedelta(minutes=random.randint(0, 10)),
            node_id=node,
            attack_type=AttackType(attack_type) if attack_type in [a.value for a in AttackType] else None,
            mitre_technique=f"T{1100 + random.randint(0, 99)}",
        )
        alerts.append(alert)
    return alerts


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
    compromised = simulation_engine.active_simulations
    nodes = list(simulation_engine.node_states.keys())[:count]
    new_alerts = generate_sample_alerts(attack_type, nodes)
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
    compromised_count = len([
        nid for nid, status in simulation_engine.node_states.items()
        if status.value in ["compromised", "critical"]
    ])
    total_attacks = sum(len(s.events) for s in all_sims)
    threat_score = min(100, compromised_count * 15 + len(all_sims) * 5)

    attack_type_counts = {}
    for sim in all_sims:
        at = sim.attack_type.value
        attack_type_counts[at] = attack_type_counts.get(at, 0) + len(sim.events)

    top_attacks = sorted(
        [{"type": k, "count": v} for k, v in attack_type_counts.items()],
        key=lambda x: x["count"], reverse=True
    )[:5]

    timeline = []
    now = datetime.now()
    for i in range(24):
        hour = now - timedelta(hours=23 - i)
        count = random.randint(0, 8) if i > 18 else random.randint(0, 3)
        if i >= 22:
            count += compromised_count * 2
        timeline.append({
            "hour": hour.strftime("%H:00"),
            "attacks": count,
            "blocked": max(0, count - random.randint(0, count)),
        })

    return {
        "total_attacks": total_attacks or random.randint(12, 48),
        "active_threats": len([s for s in all_sims if s.status == "running"]),
        "compromised_nodes": compromised_count,
        "threat_score": threat_score or random.randint(15, 35),
        "attacks_blocked": random.randint(50, 200),
        "network_health": max(20, 100 - threat_score),
        "top_attack_types": top_attacks,
        "attack_timeline": timeline,
        "recent_alerts": [a.model_dump(mode="json") for a in sorted(_alerts, key=lambda x: x.timestamp, reverse=True)[:5]],
    }
