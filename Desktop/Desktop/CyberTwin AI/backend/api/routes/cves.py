"""
CVE Intelligence endpoint — exposes real NVD data to the frontend.
"""
from fastapi import APIRouter, Query
from services.nvd_service import fetch_cves_for_attack, FALLBACK_CVES, ATTACK_CVE_KEYWORDS

router = APIRouter(prefix="/cves", tags=["cve-intelligence"])


@router.get("/")
async def get_cves(
    attack_type: str = Query("malware", description="Attack type to fetch CVEs for"),
    count: int = Query(5, ge=1, le=20),
):
    """
    Return real CVEs from NVD for a given attack type.
    Results are cached 6h. Falls back to curated list if NVD is unreachable.
    """
    cves = await fetch_cves_for_attack(attack_type, count=count)
    return {
        "attack_type": attack_type,
        "source": "NVD NIST / curated fallback",
        "count": len(cves),
        "cves": cves,
    }


@router.get("/all")
async def get_all_cves():
    """Return the full curated CVE database for all attack types."""
    return {
        attack_type: cves
        for attack_type, cves in FALLBACK_CVES.items()
    }


@router.get("/critical")
async def get_critical_cves():
    """Return only CRITICAL-severity CVEs across all attack types."""
    result = []
    for attack_type, cves in FALLBACK_CVES.items():
        for cve in cves:
            if cve.get("severity") == "CRITICAL" and cve.get("score", 0) >= 9.0:
                result.append({**cve, "attack_type": attack_type})
    result.sort(key=lambda x: x["score"], reverse=True)
    return result
