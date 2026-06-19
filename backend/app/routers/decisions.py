from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.decision import DecisionResponse
from app.services.expert_service import get_decision_history, get_sensor_history

router = APIRouter(prefix="/api/v1", tags=["decisions"])


@router.get("/decisions", response_model=list[DecisionResponse])
async def list_decisions(limit: int = Query(50, ge=1, le=200), db: AsyncSession = Depends(get_db)):
    return await get_decision_history(db, limit)


@router.get("/sensors/{sensor_name}/readings")
async def sensor_readings(
    sensor_name: str, limit: int = Query(100, ge=1, le=500), db: AsyncSession = Depends(get_db)
):
    readings = await get_sensor_history(db, sensor_name, limit)
    return [
        {
            "id": r.id,
            "sensor_name": r.sensor_name,
            "value": r.value,
            "unit": r.unit,
            "timestamp": r.timestamp.isoformat(),
        }
        for r in readings
    ]
