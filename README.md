# SIH 2026 — SIH26027
## AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways

### Problem Summary
Indian Railways currently plans maintenance (Engineering, Traction Distribution, Signal & Telecom) independently via BDMS, leading to inefficient block utilization and poor coordination. The goal is to build an AI system that integrates maintenance data from TMS, SMMS, TDMS with corridor block availability and train timetables, uses ML to prioritize/schedule maintenance by criticality & urgency, optimizes block scheduling to maximize asset uptime, and provides weekly/monthly block plans.

### Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS (no build step needed) — modern dashboard with Tailwind CDN
- **Backend**: Node.js (built-in `http` module) — REST API simulating data integration
- **AI/ML Engine**: Python stdlib (simulated ML scoring + optimization logic)
- **Data**: In-memory SQLite-simulated datasets (TMS, SMMS, TDMS, COA)

### Architecture
```
┌─────────────────────────────────────────────────────┐
│  Frontend (index.html + dashboard.js)              │
│  • Dashboard with KPIs                              │
│  • Block schedule Gantt chart                       │
│  • AI prioritization view                           │
│  • Weekly/Monthly planning                          │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (fetch)
┌──────────────────────▼──────────────────────────────┐
│  Backend (server.js)                               │
│  • GET /api/block-plan                             │
│  • GET /api/maintenance-tasks                       │
│  • GET /api/utilization                            │
│  • POST /api/optimize                              │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  AI Engine (ai_engine.py)                          │
│  • Criticality scoring (criticality × urgency)      │
│  • Conflict detection                               │
│  • Optimization (greedy scheduling)                 │
│  • Utilization calculator                           │
└─────────────────────────────────────────────────────┘
```

### Setup & Run
```bash
# Start backend API (Node.js)
cd /home/ghost/Work/sih-rail-demo
node backend/server.js &
# Server runs on http://localhost:3001

# Open frontend
# Open frontend/index.html in browser, or serve via:
cd frontend && python3 -m http.server 8080
# Dashboard at http://localhost:8080

# Run AI engine directly
python3 python-ml/ai_engine.py
```

### Key Features (Demo)
1. **Data Integration View** — simulated TMS/SMMS/TDMS/COA data merged into unified view
2. **AI Prioritization** — maintenance tasks scored by criticality × urgency × impact
3. **Optimized Block Scheduling** — greedy algorithm maximizes asset uptime, minimizes downtime
4. **Weekly & Monthly Planning** — calendar view with color-coded block plans
5. **Utilization Metrics** — real-time KPIs for asset availability and block utilization

### Source Files
- `frontend/index.html` — main dashboard page
- `frontend/dashboard.js` — frontend logic + API calls
- `frontend/style.css` — custom styles
- `backend/server.js` — Node.js REST API
- `python-ml/ai_engine.py` — AI/ML scoring + optimization engine
- `python-ml/data_generator.py` — mock railway data generator
