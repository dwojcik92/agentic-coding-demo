# Expert System — Epics & Tasks

## Epic 1: Project Scaffolding
- [x] Backend: FastAPI + SQLAlchemy + Alembic + pyproject.toml
- [x] Frontend: Vite + React + TypeScript + Tailwind + Recharts
- [x] Docker Compose: MySQL container
- [x] epics.md tracking

## Epic 2: Database & Models
- [x] MySQL connection config (pydantic-settings)
- [x] SQLAlchemy models: SensorReading, DecisionRecord
- [x] Alembic migration setup
- [x] Pydantic request/response schemas

## Epic 3: Expert Engine
- [x] Knowledge base with tomato crop profile + thresholds
- [x] Rule engine (forward-chaining, configurable rules)
- [x] Condition & CompositeCondition evaluators
- [x] 20+ rules across 6 decision types
- [x] Explanation generator (sensor → condition → decision chain)

## Epic 4: Simulator & API
- [x] Sensor stream generator (diurnal temp, light, moisture decay)
- [x] POST /api/v1/simulator/step — evaluate + store
- [x] POST /api/v1/simulator/reset — reset state
- [x] GET /api/v1/simulator/sensors — list sensors + stages
- [x] GET /api/v1/decisions — decision history
- [x] GET /api/v1/sensors/{name}/readings — sensor history

## Epic 5: Frontend Dashboard
- [x] Initial dashboard with sensor charts + decision cards
- [x] STATE-OF-THE-ART UI REVAMP (current)
- [x] Dark theme with glassmorphism panels and cyan accent
- [x] Hero bar with health ring + urgency indicators
- [x] KPI tiles (soil health, climate health, stress index, active decisions)
- [x] Multi-sensor normalized time-series (all 7 sensors overlaid)
- [x] Decision feed with priority chips + expandable reasoning
- [x] Compact sensor grid with sparklines + trend indicators
- [x] Control bar with stream/step/reset/speed controls
- [x] Reasoning trace section showing all sensor evaluations
- [x] Animations: slide-in for decisions, pulse for live data, shimmer

## Epic 6: Tests
- [x] pytest: expert engine unit tests (KB, conditions, rules, engine)
- [x] pytest: API integration tests (step, reset, list, history)
- [x] Playwright E2E test

## Security
- Security: none identified (local-only system, no auth, no user input persistence)
