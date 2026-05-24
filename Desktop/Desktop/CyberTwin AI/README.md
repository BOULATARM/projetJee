# CyberTwin AI — AI-Powered Cyber Digital Twin Platform

> **Next-generation cybersecurity platform** for real-time cyberattack simulation, AI-driven threat intelligence, and immersive 3D network visualization.

![CyberTwin AI Banner](docs/banner.png)

---

## Overview

**CyberTwin AI** creates a virtual digital twin of your network infrastructure and simulates cyberattacks in real time using artificial intelligence. Watch attacks propagate through your network, analyze threat patterns with AI, and predict the next targets — all in a stunning cyberpunk interface.

This platform serves as both a **learning environment** and a **portfolio showcase** for enterprise-grade cybersecurity tooling.

---

## Features

| Feature | Description |
|---|---|
| **3D Network Visualization** | Interactive Three.js/React Three Fiber 3D graph with real-time node status updates |
| **Attack Simulation Engine** | 12 attack scenarios including Ransomware, SQL Injection, DDoS, Zero-Day |
| **AI Threat Intelligence** | Local LLM analysis via Ollama (Llama 3 / Mistral) with fallback |
| **Predictive Attack Engine** | Graph-based prediction of next targets and propagation paths |
| **Attack Timeline Replay** | Cinematic playback of attack events with phase visualization |
| **Real-Time Alert Center** | Live security operation center with severity classification |
| **MITRE ATT&CK Mapping** | Automatic technique mapping to the MITRE ATT&CK framework |
| **AI Chat Analyst** | Interactive AI assistant for incident response guidance |
| **Threat Heatmap** | Visual risk concentration map across all network nodes |
| **Professional Dashboard** | Glassmorphism SOC dashboard with animated charts and live metrics |

---

## Tech Stack

### Frontend
- **Next.js 16** + TypeScript
- **Tailwind CSS v4** — Utility-first styling with cyberpunk theme
- **Framer Motion** — Smooth animations and transitions
- **Three.js + React Three Fiber** — 3D network visualization
- **Recharts** — Interactive data charts
- **Socket.io Client** — Real-time WebSocket updates

### Backend
- **FastAPI** + Python 3.12
- **WebSockets** — Live bidirectional communication
- **NetworkX** — Graph-based propagation modeling
- **Scikit-learn** — Machine learning for risk prediction
- **Ollama** — Local LLM inference (Llama 3, Mistral)
- **Redis** — Real-time state management
- **PostgreSQL** — Attack history and topology storage

### Infrastructure
- **Docker + Docker Compose** — Containerized deployment
- **Nginx** — Reverse proxy and WebSocket gateway

---

## Attack Scenarios

| Attack Type | MITRE Technique | Severity |
|---|---|---|
| Ransomware | T1486 | Critical |
| SQL Injection | T1190 | High |
| DDoS | T1498 | High |
| Brute Force | T1110 | Medium |
| Phishing | T1566 | High |
| Malware Propagation | T1204 | High |
| Lateral Movement | T1021 | High |
| Zero-Day Exploit | T1203 | Critical |
| Credential Stuffing | T1110.004 | Medium |
| Port Scanning | T1046 | Low |
| XSS | T1059.007 | Medium |
| Man-in-the-Middle | T1557 | High |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Client                           │
│  Next.js 16 · Three.js · Framer Motion · Recharts           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP + WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                  Nginx Reverse Proxy                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               FastAPI Backend (Python)                       │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Network   │  │  Simulation  │  │    AI Analysis       │ │
│  │  Topology  │  │   Engine     │  │  (Ollama / Llama 3)  │ │
│  └────────────┘  └──────┬───────┘  └──────────────────────┘ │
│                         │                                    │
│  ┌─────────────────────▼─────────────────────────────────┐  │
│  │              NetworkX Graph Engine                     │  │
│  │  · Propagation modeling  · Risk scoring               │  │
│  │  · Target prediction    · MITRE mapping              │  │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    PostgreSQL      Redis       Ollama
    (History)    (Real-time)   (LLM AI)
```

---

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/cybertwin-ai.git
cd cybertwin-ai

# Start all services
docker compose up -d

# Pull and run the Llama 3 model (optional - for AI features)
docker exec -it cybertwin-ai-ollama-1 ollama pull llama3

# Open the platform
open http://localhost:3000
```

### Option 2: Local Development

**Prerequisites:** Node.js 20+, Python 3.12+

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Access the platform at **http://localhost:3000**

---

## Usage Guide

### 1. Dashboard
View real-time metrics: total attacks, active threats, compromised nodes, threat score, and the 24h attack timeline.

### 2. 3D Network
Explore the virtual network topology in interactive 3D. Nodes glow red/orange/yellow as they get compromised. Click any node to inspect its details.

### 3. Attack Simulator
Select an attack type, configure intensity and propagation, then click **Launch Attack**. Watch the attack spread through the 3D network in real time.

### 4. AI Analyst
Ask the AI security analyst about:
- "Explain this ransomware attack"
- "How do I stop this propagation?"
- "What nodes are at risk next?"
- "Generate an incident report"

### 5. MITRE ATT&CK
View which MITRE techniques were triggered during simulations, highlighted on the full ATT&CK matrix.

---

## API Documentation

With the backend running, access interactive API docs at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/network/topology` | Get full network topology |
| POST | `/api/v1/simulation/start` | Launch attack simulation |
| GET | `/api/v1/simulation/metrics` | Dashboard metrics |
| GET | `/api/v1/simulation/alerts` | Security alerts |
| POST | `/api/v1/ai/analyze` | AI threat analysis |
| POST | `/api/v1/ai/chat` | Chat with AI analyst |
| WS | `/ws` | Real-time WebSocket stream |

---

## Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Backend (`.env`)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/cybertwin
REDIS_URL=redis://localhost:6379
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

## Project Structure

```
cybertwin-ai/
├── frontend/                    # Next.js 16 application
│   └── src/
│       ├── app/                 # App Router pages
│       ├── components/
│       │   ├── layout/          # Sidebar, Header
│       │   ├── dashboard/       # Stats, Charts, Gauge
│       │   ├── network/         # 3D Network Graph
│       │   ├── simulation/      # Attack Simulator UI
│       │   ├── alerts/          # Alert Center
│       │   ├── ai/              # AI Chat & Analysis
│       │   ├── timeline/        # Attack Timeline
│       │   ├── mitre/           # MITRE ATT&CK Matrix
│       │   └── heatmap/         # Threat Heatmap
│       ├── hooks/               # WebSocket, custom hooks
│       ├── lib/                 # API client
│       └── types/               # TypeScript types
├── backend/                     # FastAPI application
│   ├── main.py                  # App entrypoint + WebSocket
│   ├── api/
│   │   ├── routes/              # network, simulation, ai
│   │   └── models/              # Pydantic schemas
│   ├── simulation/
│   │   └── engine.py            # Attack simulation engine
│   ├── ai/
│   │   └── analyzer.py          # Ollama/LLM integration
│   └── core/
│       └── config.py            # Settings
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## Screenshots

> **Dashboard** — Real-time SOC metrics with threat timeline and activity feed

> **3D Network** — Interactive topology with color-coded attack propagation

> **Attack Simulator** — Launch ransomware, DDoS, SQL injection and more

> **AI Analyst** — Chat-based incident response guidance

> **MITRE ATT&CK** — Automated technique mapping

---

## Roadmap

- [ ] World cyberattack map with GeoIP visualization
- [ ] Voice AI assistant integration
- [ ] Multi-user collaboration (WebRTC)
- [ ] PDF incident report generation
- [ ] SIEM integration (Splunk, Elastic)
- [ ] Kubernetes deployment manifests
- [ ] Blockchain attack simulation
- [ ] Dark/light theme toggle
- [ ] Attack export (JSON/CSV/PDF)
- [ ] Custom network topology import

---

## Author

**Mohamed Amine Atik** — Cybersecurity & AI Engineering  
Built as a PFE (Final Year Project) showcase demonstrating advanced full-stack development, cybersecurity simulation, and AI integration.

---

## License

MIT License — Free for educational and portfolio use.

---

*CyberTwin AI — Where AI meets Cybersecurity*
