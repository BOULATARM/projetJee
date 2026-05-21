from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from simulation.engine import simulation_engine
from ai.analyzer import get_threat_analysis, get_ai_chat_response
from api.models.schemas import ChatRequest
import json

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/analyze")
async def analyze_threat(attack_type: str, simulation_id: str = None):
    result = None
    if simulation_id:
        result = simulation_engine.get_simulation_status(simulation_id)

    affected_nodes = result.compromised_nodes if result else list(simulation_engine.node_states.keys())[:5]
    paths = [[n] for n in affected_nodes[:3]]

    analysis = await get_threat_analysis(attack_type, affected_nodes, paths)
    predicted = simulation_engine.predict_next_targets(affected_nodes)
    analysis.predicted_next_targets = predicted

    return analysis.model_dump()


@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    context = request.context or {
        "attack_type": "unknown",
        "compromised_nodes": [],
        "threat_score": 0,
    }
    history = [m.model_dump() for m in request.history]
    response = await get_ai_chat_response(request.message, context, history)
    return {"response": response, "model": "CyberTwin AI"}


@router.get("/predict/{node_id}")
async def predict_node_risk(node_id: str):
    topology = simulation_engine.get_topology()
    node = next((n for n in topology.nodes if n.id == node_id), None)
    if not node:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Node not found")

    compromised = [nid for nid, status in simulation_engine.node_states.items()
                   if status.value in ["compromised", "critical"]]
    predicted_targets = simulation_engine.predict_next_targets(compromised)
    risk = 0.85 if node_id in predicted_targets else 0.25

    return {
        "node_id": node_id,
        "node_label": node.label,
        "risk_score": risk,
        "is_predicted_target": node_id in predicted_targets,
        "risk_factors": [
            "Adjacent to compromised nodes" if node_id in predicted_targets else "Low lateral movement exposure",
            f"Running {len(node.services)} exposed services",
            f"OS: {node.os or 'Unknown'}",
        ]
    }
