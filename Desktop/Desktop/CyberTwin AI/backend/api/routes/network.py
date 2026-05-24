from fastapi import APIRouter
from simulation.engine import simulation_engine

router = APIRouter(prefix="/network", tags=["network"])


@router.get("/topology")
async def get_topology():
    topology = simulation_engine.get_topology()
    return topology.model_dump()


@router.post("/reset")
async def reset_topology():
    simulation_engine.reset_topology()
    return {"status": "ok", "message": "Network topology reset to safe state"}


@router.get("/nodes/{node_id}")
async def get_node(node_id: str):
    topology = simulation_engine.get_topology()
    node = next((n for n in topology.nodes if n.id == node_id), None)
    if not node:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Node not found")
    return node.model_dump()
