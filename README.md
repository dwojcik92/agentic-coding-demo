# Expert System — Precision Agriculture

A full-stack expert system for sensor-driven decision-making in precision agriculture. Built entirely with **opencode** and a cheap deepseek model — zero LLM dependency in the decision loop.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sensor     │────▶│   Expert     │────▶│   Decision   │
│  Simulator   │     │   Engine     │     │    Feed      │
│  (FastAPI)   │     │  (Rule-based)│     │  (Dashboard) │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                      ┌─────┴─────┐
                      │  MySQL DB │
                      │ rules +   │
                      │ kb + logs │
                      └───────────┘
```

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11+), SQLAlchemy 2.0 |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Database | MySQL 8.0 (Docker) |
| Expert Engine | Pure Python — configurable rules, no LLM |
| Icons | Lucide React |
| Testing | pytest (backend), Playwright (E2E) |

## Quick Start

```bash
docker compose up
```

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

Without Docker:

```bash
# Backend
cd backend
uv venv && source .venv/bin/activate
uv pip install -e ".[dev]"
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Database (required)
docker compose up mysql
```

## Architecture

### Expert Engine (`backend/app/core/expert/`)

- **Knowledge Base**: Configurable crop profiles with sensor thresholds per growth stage. Ships with a complete tomato profile (4 stages, 7 sensors). Editable through the UI.
- **Rule Engine**: Forward-chaining rule evaluator. Each rule has a name, description, decision type, priority, composite condition, and action recommendation.
- **22 built-in rules** across 6 decision types: irrigation, fertilization, plant stress, disease risk, growth quality, observation. Editable through the UI.
- **Explanation chains**: Every decision includes the sensor readings, conditions met, and the rule that triggered it.
- All rules and knowledge base data persist in MySQL and survive restarts.

### Sensor Simulator (`backend/app/services/simulator.py`)

Generates realistic time-series data with diurnal temperature curves, solar light patterns, soil moisture decay, and Gaussian noise.

### Frontend (`frontend/src/`)

4 tabs at the top:

| Tab | What you can do |
|---|---|
| **Dashboard** | Real-time sensor telemetry, KPI tiles, multi-sensor time series overlay, decision feed with expandable reasoning, sensor grid with sparklines, reasoning trace |
| **Decisions** | Full decision history from DB. Search, filter by type or urgency, expand to see explanation + sensor snapshot |
| **Rules** | Browse all 22 rules grouped by type or priority. **Add, edit, delete rules** through a modal form with dynamic condition rows (sensor + operator + value) |
| **Knowledge Base** | Sensor thresholds per growth stage as inline-editable table. **Add/delete growth stages. Add/edit/delete sensor definitions.** Two view modes: table with range bars, or card view |

### Simulation Controls

- **Stream** — auto-advance at configurable speed (0.5x–5x)
- **Step** — single advance
- **Reset** — restart simulator state
- Live "engine" indicator — no LLM in the loop

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/simulator/step` | Advance simulation, evaluate rules |
| POST | `/api/v1/simulator/reset` | Reset simulator state |
| GET | `/api/v1/simulator/sensors` | List sensors and growth stages |
| GET | `/api/v1/decisions` | Decision history |
| GET | `/api/v1/sensors/{name}/readings` | Sensor reading history |
| GET | `/api/v1/rules` | List all rules |
| POST | `/api/v1/rules` | Create a rule |
| PUT | `/api/v1/rules/{name}` | Update a rule |
| DELETE | `/api/v1/rules/{name}` | Delete a rule |
| GET | `/api/v1/knowledge-base` | Full KB (thresholds per stage, sensor defs) |
| PUT | `/api/v1/knowledge-base/thresholds/{stage}/{sensor}` | Update threshold |
| POST | `/api/v1/knowledge-base/stages/{stage}` | Add growth stage |
| DELETE | `/api/v1/knowledge-base/stages/{stage}` | Delete growth stage |
| POST | `/api/v1/knowledge-base/sensors` | Add sensor definition |
| PUT | `/api/v1/knowledge-base/sensors/{name}` | Update sensor definition |
| DELETE | `/api/v1/knowledge-base/sensors/{name}` | Delete sensor definition |

## Tests

```bash
cd backend
source .venv/bin/activate
pytest                    # 20 unit + integration tests

cd frontend
npx playwright test       # E2E (requires backend running)
```

## Demo

This project was built in real time as a demonstration of **opencode** (https://opencode.ai) — an agentic coding CLI that pairs you with AI to build software. Every feature was implemented through natural language collaboration, with the AI handling boilerplate, architecture, and implementation while the developer reviewed and directed.

Tech used: the cheapest available deepseek model.

Tags: `2026.25.1` through `2026.25.7`
