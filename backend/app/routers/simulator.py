from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.decision import ExpertResult
from app.schemas.sensor import SensorBatch
from app.services.expert_service import evaluate_and_store, get_engine
from app.services.simulator import SensorSimulator

router = APIRouter(prefix="/api/v1/simulator", tags=["simulator"])

_simulator = SensorSimulator()


@router.post("/step")
async def simulation_step(
    body: SensorBatch | None = None, db: AsyncSession = Depends(get_db)
) -> ExpertResult:
    if body:
        sensor_data = body.readings
        growth_stage = body.growth_stage
    else:
        sensor_data = _simulator.generate()
        growth_stage = "fruiting"

    result = await evaluate_and_store(sensor_data, growth_stage, db)

    return ExpertResult(
        sensor_evaluations={
            k: {
                "status": v["status"],
                "value": v["value"],
                "deviation": v["deviation"],
                "unit": v["unit"],
                "sensor_name": v["sensor_name"],
                "threshold": v["threshold"],
                "detail": v["detail"],
            }
            for k, v in result["sensor_evaluations"].items()
        },
        decisions=[
            {
                "type": d.type.value,
                "action": d.action,
                "priority": d.priority,
                "explanation": d.explanation,
                "sensor_readings": d.sensor_readings,
                "conditions_met": d.conditions_met,
            }
            for d in result["decisions"]
        ],
        growth_stage=result["growth_stage"],
        crop=result["crop"],
    )


@router.post("/reset")
async def reset_simulation():
    global _simulator
    _simulator = SensorSimulator()
    return {"message": "Simulator reset to initial state"}


@router.get("/sensors")
async def list_sensors():
    engine = get_engine()
    return {
        "sensors": [
            {"name": name, "unit": sd.unit, "description": sd.description}
            for name, sd in engine.kb.profile.sensors.items()
        ],
        "growth_stages": engine.kb.get_growth_stages(),
        "crop": engine.kb.profile.name,
    }
