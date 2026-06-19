import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.decision import DecisionRecord
from app.models.sensor_reading import SensorReading
from app.services.rule_service import get_engine


async def evaluate_and_store(
    sensor_data: dict[str, float], growth_stage: str, db: AsyncSession
) -> dict:
    engine = get_engine()
    result = engine.evaluate(sensor_data, growth_stage)

    sensor_snapshot_json = json.dumps(sensor_data)

    for d in result["decisions"]:
        record = DecisionRecord(
            decision_type=d.type.value,
            action=d.action,
            priority=d.priority,
            explanation=d.explanation,
            growth_stage=growth_stage,
            sensor_snapshot=sensor_snapshot_json,
        )
        db.add(record)

    for name, value in sensor_data.items():
        sr = SensorReading(
            sensor_name=name,
            value=value,
            unit=_get_unit(name),
        )
        db.add(sr)

    await db.commit()

    return result


def _get_unit(sensor_name: str) -> str:
    units = {
        "soil_moisture": "%",
        "temperature": "°C",
        "humidity": "%",
        "light_intensity": "W/m²",
        "soil_ph": "pH",
        "nitrogen": "mg/kg",
        "wind_speed": "km/h",
    }
    return units.get(sensor_name, "unknown")


async def get_decision_history(db: AsyncSession, limit: int = 50):
    stmt = select(DecisionRecord).order_by(DecisionRecord.timestamp.desc()).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_sensor_history(db: AsyncSession, sensor_name: str, limit: int = 100):
    stmt = (
        select(SensorReading)
        .where(SensorReading.sensor_name == sensor_name)
        .order_by(SensorReading.timestamp.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
