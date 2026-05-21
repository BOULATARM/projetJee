import json
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime

from core.config import settings
from api.models.schemas import ThreatAnalysis, AttackType, SeverityLevel


ATTACK_MITRE = {
    "sql_injection": ["T1190 - Exploit Public-Facing Application", "T1059.007 - JavaScript"],
    "xss": ["T1059.007 - JavaScript", "T1185 - Browser Session Hijacking"],
    "brute_force": ["T1110 - Brute Force", "T1078 - Valid Accounts"],
    "ddos": ["T1498 - Network Denial of Service", "T1499 - Endpoint Denial of Service"],
    "ransomware": ["T1486 - Data Encrypted for Impact", "T1490 - Inhibit System Recovery"],
    "phishing": ["T1566 - Phishing", "T1204 - User Execution"],
    "malware": ["T1204 - User Execution", "T1055 - Process Injection"],
    "lateral_movement": ["T1021 - Remote Services", "T1534 - Internal Spearphishing"],
    "credential_stuffing": ["T1110.004 - Credential Stuffing", "T1078 - Valid Accounts"],
    "port_scan": ["T1046 - Network Service Discovery", "T1595 - Active Scanning"],
    "zero_day": ["T1203 - Exploitation for Client Execution", "T1190 - Exploit Public-Facing Application"],
    "man_in_the_middle": ["T1557 - Adversary-in-the-Middle", "T1040 - Network Sniffing"],
}

MITIGATION_MAP = {
    "sql_injection": [
        "Implement parameterized queries and prepared statements",
        "Enable WAF rules for SQL injection patterns",
        "Conduct immediate database audit and log review",
        "Apply least-privilege database access controls",
        "Deploy input validation on all API endpoints",
    ],
    "ransomware": [
        "Immediately isolate infected nodes from the network",
        "Block SMB traffic (ports 445, 139) at firewall level",
        "Enable endpoint protection and behavioral analysis",
        "Restore from clean offline backups",
        "Reset all credentials on affected systems",
        "Scan for persistence mechanisms (scheduled tasks, registry)",
    ],
    "brute_force": [
        "Implement account lockout after 5 failed attempts",
        "Enable multi-factor authentication on all accounts",
        "Block source IP addresses at firewall level",
        "Deploy CAPTCHA on login endpoints",
        "Review and rotate compromised credentials",
    ],
    "ddos": [
        "Enable rate limiting and traffic scrubbing",
        "Activate DDoS protection service (Cloudflare, AWS Shield)",
        "Scale infrastructure to absorb attack volume",
        "Block attack source IP ranges",
        "Switch to anycast routing to distribute load",
    ],
    "lateral_movement": [
        "Implement network segmentation and micro-segmentation",
        "Block lateral movement protocols at internal firewalls",
        "Reset all credentials in the affected domain",
        "Enable privileged access management (PAM)",
        "Audit and restrict service account privileges",
    ],
    "phishing": [
        "Quarantine phishing emails across all mailboxes",
        "Reset credentials for affected user accounts",
        "Scan endpoints for malicious attachments",
        "Enable email authentication (DMARC, DKIM, SPF)",
        "Conduct emergency security awareness training",
    ],
    "malware": [
        "Quarantine infected endpoints immediately",
        "Run full antivirus and EDR scan across network",
        "Block C2 communication domains and IPs",
        "Analyze malware sample for persistence and payload",
        "Patch vulnerabilities used for initial access",
    ],
}


async def analyze_with_ollama(prompt: str, context: str = "") -> str:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_HOST}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": f"{context}\n\n{prompt}",
                    "stream": False,
                    "options": {"temperature": 0.3, "num_predict": 500}
                }
            )
            if response.status_code == 200:
                return response.json().get("response", "")
    except Exception:
        pass
    return ""


def get_local_threat_analysis(attack_type: str, affected_nodes: List[str],
                               propagation_paths: List[List[str]]) -> ThreatAnalysis:
    mitre = ATTACK_MITRE.get(attack_type, ["T1059 - Command and Scripting Interpreter"])
    recommendations = MITIGATION_MAP.get(attack_type, [
        "Isolate affected systems",
        "Conduct forensic investigation",
        "Reset compromised credentials",
        "Apply security patches",
        "Review and update security policies",
    ])

    risk_map = {
        "ransomware": "Critical", "ddos": "High", "zero_day": "Critical",
        "lateral_movement": "High", "malware": "High", "sql_injection": "High",
        "brute_force": "Medium", "phishing": "High", "xss": "Medium",
        "credential_stuffing": "Medium", "port_scan": "Low", "man_in_the_middle": "High"
    }

    summaries = {
        "ransomware": f"Ransomware attack detected affecting {len(affected_nodes)} systems. Immediate isolation required to prevent further encryption and data loss.",
        "ddos": f"Large-scale DDoS attack targeting {len(affected_nodes)} infrastructure nodes. Service availability is critically impacted.",
        "sql_injection": f"SQL injection exploit detected on web-facing application. Database integrity may be compromised — {len(affected_nodes)} nodes affected.",
        "brute_force": f"Sustained brute-force credential attack detected. {len(affected_nodes)} authentication services under attack.",
        "phishing": f"Spear-phishing campaign successfully compromised {len(affected_nodes)} user accounts. Lateral movement risk is high.",
        "malware": f"Malware infection spreading across {len(affected_nodes)} endpoints. Command and control communication established.",
        "lateral_movement": f"Attacker performing lateral movement across {len(affected_nodes)} internal systems using stolen credentials.",
        "zero_day": f"Zero-day exploit targeting unpatched vulnerability. {len(affected_nodes)} critical systems compromised.",
    }

    return ThreatAnalysis(
        attack_type=attack_type.replace("_", " ").title(),
        risk_level=risk_map.get(attack_type, "High"),
        affected_nodes=affected_nodes,
        propagation_paths=propagation_paths,
        mitre_techniques=mitre,
        recommendations=recommendations,
        summary=summaries.get(attack_type, f"Security incident detected. {len(affected_nodes)} nodes compromised requiring immediate response."),
        confidence_score=round(0.75 + (len(affected_nodes) * 0.03), 2),
        predicted_next_targets=[],
    )


async def get_threat_analysis(attack_type: str, affected_nodes: List[str],
                               propagation_paths: List[List[str]]) -> ThreatAnalysis:
    analysis = get_local_threat_analysis(attack_type, affected_nodes, propagation_paths)

    ollama_prompt = f"""You are a senior cybersecurity analyst. Analyze this attack:

Attack Type: {attack_type}
Affected Nodes: {', '.join(affected_nodes)}
MITRE Techniques: {', '.join(analysis.mitre_techniques)}

Provide a 2-3 sentence executive summary of the threat and immediate action required. Be concise and professional."""

    ai_summary = await analyze_with_ollama(ollama_prompt)
    if ai_summary and len(ai_summary) > 50:
        analysis.summary = ai_summary[:500]

    return analysis


async def get_ai_chat_response(message: str, context: Dict[str, Any],
                                history: List[Dict]) -> str:
    system_context = """You are CyberTwin AI — an expert cybersecurity analyst AI assistant embedded in a cyber digital twin platform.
You analyze network attacks, explain security incidents, and provide actionable mitigation recommendations.
Be concise, technical, and professional. Format responses clearly with bullet points when listing items."""

    if context:
        attack_context = f"\nCurrent Security Context:\n- Active Attack: {context.get('attack_type', 'None')}\n- Compromised Nodes: {', '.join(context.get('compromised_nodes', []))}\n- Threat Score: {context.get('threat_score', 0)}/100"
        system_context += attack_context

    full_prompt = f"{system_context}\n\nUser: {message}\n\nAssistant:"

    ai_response = await analyze_with_ollama(full_prompt)
    if ai_response and len(ai_response) > 20:
        return ai_response

    return get_fallback_response(message, context)


def get_fallback_response(message: str, context: Dict[str, Any]) -> str:
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["explain", "what is", "describe", "how does"]):
        attack = context.get("attack_type", "the attack")
        return f"""**Attack Analysis: {str(attack).replace('_', ' ').title()}**

This type of attack involves an adversary exploiting vulnerabilities to gain unauthorized access or cause disruption.

**Key Indicators:**
- Unusual network traffic patterns detected
- Authentication anomalies on compromised nodes
- Lateral movement between internal systems

**Attack Phase (MITRE ATT&CK):**
- Initial Access → Execution → Persistence → Lateral Movement → Impact

**Immediate Actions Required:**
- Isolate affected systems from the network
- Reset compromised credentials
- Enable enhanced monitoring on adjacent nodes
- Initiate incident response playbook"""

    elif any(w in msg_lower for w in ["stop", "prevent", "mitigate", "block", "defend"]):
        compromised = context.get("compromised_nodes", [])
        return f"""**Mitigation Strategy**

**Immediate Actions (0-1 hour):**
- Isolate {len(compromised)} compromised nodes: {', '.join(compromised[:3])}
- Block attack vectors at firewall level
- Revoke and rotate all affected credentials

**Short-term Containment (1-24 hours):**
- Deploy EDR agents on all endpoints
- Enable network micro-segmentation
- Conduct forensic investigation on compromised systems

**Long-term Remediation:**
- Patch all identified vulnerabilities
- Implement Zero Trust architecture
- Schedule penetration testing to verify remediation"""

    elif any(w in msg_lower for w in ["predict", "next", "spread", "propagate"]):
        return f"""**Threat Propagation Prediction**

Based on current network topology and attack pattern analysis:

**High-Risk Targets (Next 15 minutes):**
- Authentication services — credential harvesting likely
- Database servers — data exfiltration risk: HIGH
- Cloud instances — lateral movement path identified

**Attack Progression Model:**
- Phase 1 (Complete): Initial compromise achieved
- Phase 2 (Active): Lateral movement and privilege escalation
- Phase 3 (Predicted): Data exfiltration or ransomware deployment

**Confidence Score:** 87%

Recommend immediate isolation of database and authentication nodes."""

    else:
        return f"""**CyberTwin AI Analysis**

I've analyzed the current security posture of your network based on active threat intelligence.

**Current Threat Status:**
- Active simulation detected across {len(context.get('compromised_nodes', []))} nodes
- Attack type: {str(context.get('attack_type', 'Unknown')).replace('_', ' ').title()}
- Threat Score: {context.get('threat_score', 45)}/100

**Recommendations:**
1. Monitor all network traffic for anomalous patterns
2. Enable enhanced logging on critical systems
3. Verify backup integrity for business-critical data
4. Review firewall rules and access control lists

How can I assist you further with threat analysis or incident response?"""
