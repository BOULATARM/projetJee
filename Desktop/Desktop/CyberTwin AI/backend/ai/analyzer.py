"""
AI Analyzer — CyberTwin AI
Priority: Groq API (Llama 3 70B) → Ollama local → Fallback responses
"""
import httpx
from typing import List, Dict, Any
from core.config import settings
from api.models.schemas import ThreatAnalysis, AttackType, SeverityLevel

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """Tu es CyberTwin AI — un analyste SOC expert intégré dans une plateforme de jumeau numérique cyber.
Tu analyses des simulations de cyberattaques réelles, expliques les techniques MITRE ATT&CK, et fournis des recommandations de réponse aux incidents concrètes.
IMPORTANT : Tu réponds TOUJOURS en français, même si la question est en anglais.
Sois concis, technique et professionnel. Utilise des puces pour lister les éléments.
Référence toujours les IDs MITRE spécifiques (ex: T1566.001) quand c'est pertinent."""

ATTACK_MITRE = {
    "ransomware":          ["T1566.001 - Spearphishing Attachment", "T1059.001 - PowerShell",
                            "T1486 - Data Encrypted for Impact", "T1490 - Inhibit System Recovery"],
    "sql_injection":       ["T1190 - Exploit Public-Facing Application", "T1005 - Data from Local System",
                            "T1048.003 - Exfiltration Over HTTPS"],
    "brute_force":         ["T1110.001 - Password Guessing", "T1110.003 - Password Spraying",
                            "T1078 - Valid Accounts"],
    "ddos":                ["T1498.001 - Direct Network Flood", "T1498.002 - Reflection Amplification",
                            "T1499.002 - Service Exhaustion Flood"],
    "phishing":            ["T1566.002 - Spearphishing Link", "T1056.003 - Web Portal Capture",
                            "T1539 - Steal Web Session Cookie"],
    "malware":             ["T1195.002 - Compromise Software Supply Chain", "T1055.001 - DLL Injection",
                            "T1071.001 - Web Protocols C2"],
    "lateral_movement":    ["T1003.001 - LSASS Memory", "T1550.002 - Pass the Hash",
                            "T1021.001 - Remote Desktop Protocol"],
    "zero_day":            ["T1190 - Exploit Public-Facing Application", "T1068 - Exploitation for Privilege Escalation",
                            "T1070.001 - Clear Windows Event Logs"],
    "credential_stuffing": ["T1110.004 - Credential Stuffing", "T1078 - Valid Accounts",
                            "T1539 - Steal Web Session Cookie"],
    "port_scan":           ["T1595.001 - Scanning IP Blocks", "T1046 - Network Service Discovery"],
    "man_in_the_middle":   ["T1557.001 - ARP Cache Poisoning", "T1040 - Network Sniffing"],
    "xss":                 ["T1059.007 - JavaScript", "T1185 - Browser Session Hijacking"],
}

MITIGATION_MAP = {
    "ransomware": [
        "Isolate infected nodes from network immediately (segment VLAN)",
        "Block SMB ports 445/139 at internal firewall",
        "Kill suspicious processes: svchost32.exe, powershell.exe -enc",
        "Restore from offline backup — verify integrity before restore",
        "Reset ALL domain credentials (assume full AD compromise)",
        "Hunt for persistence: HKCU\\Run keys, scheduled tasks, WMI subscriptions",
    ],
    "sql_injection": [
        "Take vulnerable endpoint offline immediately",
        "Enable WAF rules: block UNION, SELECT, DROP, INSERT patterns",
        "Audit database logs for exfiltrated data (SELECT * patterns)",
        "Implement parameterized queries on all DB-facing endpoints",
        "Rotate database credentials and audit user privileges",
    ],
    "brute_force": [
        "Block source IPs at firewall (threat intel: known Tor exit nodes)",
        "Enforce account lockout: 5 attempts → 15 min lockout",
        "Enable MFA on all exposed authentication services immediately",
        "Review successful logins post-attack for compromised accounts",
        "Rate-limit login endpoints: max 10 req/min per IP",
    ],
    "lateral_movement": [
        "Isolate compromised hosts — block SMB/RDP/WinRM laterally",
        "Reset KRBTGT password twice (24h apart) to invalidate Kerberos tickets",
        "Deploy CrowdStrike/Defender EDR on all endpoints",
        "Audit service accounts — remove excessive domain privileges",
        "Enable Windows Credential Guard to protect NTLM hashes",
    ],
    "phishing": [
        "Quarantine phishing email across all mailboxes (search by sender/subject)",
        "Reset credentials for all users who clicked the link",
        "Revoke active sessions (Azure AD / Okta) for affected accounts",
        "Enable DMARC enforcement to block spoofed sender domains",
        "Hunt for OAuth app grants added by compromised accounts",
    ],
    "malware": [
        "Quarantine infected endpoints — prevent C2 communication",
        "Block C2 IPs/domains at firewall and DNS level",
        "Run YARA scan across all endpoints for malware signatures",
        "Analyze malware sample: strings, imports, network behavior",
        "Patch the initial access vector (check CVE in simulation events)",
    ],
    "ddos": [
        "Activate upstream DDoS scrubbing (Cloudflare Magic Transit, AWS Shield)",
        "Enable rate limiting: SYN cookies, connection rate limits",
        "Null-route attack source IP ranges with ISP coordination",
        "Scale horizontally: add CDN caching to absorb HTTP flood",
        "Engage ISP for upstream traffic filtering",
    ],
    "zero_day": [
        "Take vulnerable system offline immediately — no patch available",
        "Apply vendor workarounds or WAF virtual patching",
        "Assume full compromise — conduct forensic investigation",
        "Hunt for webshells, backdoors, new admin accounts",
        "Report to CISA/vendor for coordinated disclosure",
    ],
    "credential_stuffing": [
        "Force password reset on all accounts with successful logins from attack IPs",
        "Enable MFA — makes stuffed credentials useless",
        "Integrate HaveIBeenPwned API to detect compromised credentials",
        "Implement behavioral analytics to detect account takeover patterns",
        "Rate-limit and CAPTCHA all authentication endpoints",
    ],
}


# ─── Groq API ────────────────────────────────────────────────────────────────

async def call_groq(messages: list, max_tokens: int = 600) -> str:
    """Call Groq API with Llama 3 70B. Returns empty string on failure."""
    if not settings.GROQ_API_KEY:
        return ""
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.GROQ_MODEL,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": 0.3,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
    except Exception:
        return ""


async def call_ollama(prompt: str) -> str:
    """Fallback to local Ollama if running."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_HOST}/api/generate",
                json={"model": settings.OLLAMA_MODEL, "prompt": prompt,
                      "stream": False, "options": {"temperature": 0.3, "num_predict": 400}},
            )
            if resp.status_code == 200:
                return resp.json().get("response", "")
    except Exception:
        pass
    return ""


# ─── Threat Analysis ─────────────────────────────────────────────────────────

async def get_threat_analysis(attack_type: str, affected_nodes: List[str],
                               propagation_paths: List[List[str]]) -> ThreatAnalysis:
    mitre = ATTACK_MITRE.get(attack_type, ["T1059 - Command and Scripting Interpreter"])
    recommendations = MITIGATION_MAP.get(attack_type, [
        "Isolate affected systems immediately",
        "Conduct forensic investigation",
        "Reset compromised credentials",
        "Apply security patches",
    ])

    risk_map = {
        "ransomware": "Critical", "zero_day": "Critical", "lateral_movement": "High",
        "malware": "High", "sql_injection": "High", "phishing": "High",
        "ddos": "High", "brute_force": "Medium", "credential_stuffing": "Medium",
        "xss": "Medium", "port_scan": "Low", "man_in_the_middle": "High",
    }

    # Try Groq first
    groq_messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": (
            f"Attack simulation completed. Write a 3-sentence executive summary for the SOC team.\n\n"
            f"Attack type: {attack_type.replace('_', ' ').upper()}\n"
            f"Compromised nodes ({len(affected_nodes)}): {', '.join(affected_nodes)}\n"
            f"MITRE techniques used: {', '.join(mitre)}\n"
            f"Propagation paths: {len(propagation_paths)} paths identified\n\n"
            f"Be specific, technical, and urgent. Mention the attack phase and immediate risk."
        )},
    ]

    summary = await call_groq(groq_messages, max_tokens=250)
    if not summary:
        summary = await call_ollama(groq_messages[1]["content"])
    if not summary:
        # Static fallback
        summaries = {
            "ransomware": f"Ransomware campaign successfully compromised {len(affected_nodes)} systems using spearphishing and PowerShell execution. Shadow copies have been deleted and file encryption is in progress — immediate isolation required to prevent full data loss. Threat actor achieved persistence via registry run keys before launching encryption payload.",
            "lateral_movement": f"Attacker achieved lateral movement across {len(affected_nodes)} internal systems using Pass-the-Hash after dumping LSASS memory. Domain credentials are compromised — assume full AD takeover. Immediate KRBTGT reset and credential rotation required across all systems.",
            "sql_injection": f"SQL injection exploited on public-facing application, exposing backend database with {len(affected_nodes)} connected systems. UNION-based extraction confirmed — assume full database dump. Immediate WAF enforcement and database credential rotation required.",
            "malware": f"Malware implant deployed across {len(affected_nodes)} endpoints with active C2 communication established. DLL injection into legitimate processes detected for defense evasion. Quarantine all affected nodes and block C2 infrastructure at network perimeter.",
            "zero_day": f"Zero-day exploit achieved unauthenticated RCE on {len(affected_nodes)} systems — no patch available. SYSTEM-level access confirmed with antivirus disabled. Take affected systems offline immediately and apply vendor workaround.",
        }
        summary = summaries.get(attack_type,
            f"Security incident detected: {attack_type.replace('_',' ').title()} affecting {len(affected_nodes)} nodes. "
            f"Immediate containment and forensic investigation required.")

    return ThreatAnalysis(
        attack_type=attack_type.replace("_", " ").title(),
        risk_level=risk_map.get(attack_type, "High"),
        affected_nodes=affected_nodes,
        propagation_paths=propagation_paths,
        mitre_techniques=mitre,
        recommendations=recommendations,
        summary=summary,
        confidence_score=round(min(0.98, 0.72 + len(affected_nodes) * 0.04), 2),
        predicted_next_targets=[],
    )


# ─── Chat ────────────────────────────────────────────────────────────────────

async def get_ai_chat_response(message: str, context: Dict[str, Any],
                                history: list) -> str:
    # Build context string from real simulation data
    ctx_parts = []
    if context.get("attack_type"):
        ctx_parts.append(f"Active attack: {context['attack_type'].replace('_',' ').upper()}")
    if context.get("compromised_nodes"):
        ctx_parts.append(f"Compromised nodes: {', '.join(context['compromised_nodes'])}")
    if context.get("threat_score"):
        ctx_parts.append(f"Threat score: {context['threat_score']}/100")

    system = SYSTEM_PROMPT
    if ctx_parts:
        system += "\n\nCurrent simulation context:\n" + "\n".join(f"- {c}" for c in ctx_parts)

    # Build message history for Groq
    messages = [{"role": "system", "content": system}]
    for h in history[-6:]:  # last 6 exchanges for context
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    messages.append({"role": "user", "content": message})

    # Try Groq
    response = await call_groq(messages, max_tokens=600)
    if response:
        return response

    # Try Ollama
    prompt = f"{system}\n\nUser: {message}\nAssistant:"
    response = await call_ollama(prompt)
    if response and len(response) > 20:
        return response

    # Static fallback
    return _static_fallback(message, context)


def _static_fallback(message: str, context: Dict[str, Any]) -> str:
    msg = message.lower()
    attack = context.get("attack_type", "unknown").replace("_", " ").title()
    nodes = context.get("compromised_nodes", [])
    score = context.get("threat_score", 0)

    if any(w in msg for w in ["explain", "what", "how", "describe", "tell"]):
        return f"""**{attack} — Technical Analysis**

**Attack Summary:**
This {attack} simulation executed a full MITRE ATT&CK kill chain across {len(nodes)} network nodes, achieving persistence and lateral movement before reaching the impact phase.

**Observed TTPs:**
{chr(10).join(f"- {t}" for t in ATTACK_MITRE.get(context.get("attack_type",""), ["T1059 - Command and Scripting Interpreter"]))}

**Affected Systems:** {', '.join(nodes) if nodes else 'None yet'}
**Current Risk Level:** {"CRITICAL" if score >= 80 else "HIGH" if score >= 50 else "MEDIUM"}

*Configure your Groq API key in `.env` for dynamic AI responses.*"""

    if any(w in msg for w in ["stop", "prevent", "mitigate", "block", "defend", "fix"]):
        at = context.get("attack_type", "malware")
        mitigations = MITIGATION_MAP.get(at, ["Isolate affected systems", "Reset credentials", "Apply patches"])
        return f"""**Incident Response — {attack}**

**Immediate Actions (now):**
{chr(10).join(f"- {m}" for m in mitigations[:3])}

**Containment (1-4 hours):**
{chr(10).join(f"- {m}" for m in mitigations[3:])}

**Affected nodes to prioritize:** {', '.join(nodes[:4]) if nodes else 'Run a simulation first'}

*Configure your Groq API key in `.env` for dynamic AI responses.*"""

    return f"""**CyberTwin AI — SOC Status**

- **Threat Score:** {score}/100
- **Compromised Nodes:** {len(nodes)} ({', '.join(nodes[:3])}{'...' if len(nodes) > 3 else ''})
- **Active Attack:** {attack}

Ask me to explain the attack, suggest mitigations, or predict next targets.

*Configure your Groq API key in `.env` for dynamic AI responses.*"""
