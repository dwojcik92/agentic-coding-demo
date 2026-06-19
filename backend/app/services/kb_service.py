from sqlalchemy import select, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.expert.knowledge_base import KnowledgeBase, Threshold, SensorDef, CropProfile, TOMATO_PROFILE
from app.models.kb_models import ThresholdModel, SensorDefModel
from app.services.rule_service import rebuild_engine_with_kb


async def init_kb(db: AsyncSession):
    """Seed thresholds and sensor defs from built-in defaults if empty."""
    t_result = await db.execute(select(ThresholdModel).limit(1))
    s_result = await db.execute(select(SensorDefModel).limit(1))
    if t_result.scalar_one_or_none() and s_result.scalar_one_or_none():
        return

    profile = TOMATO_PROFILE
    for stage_name, sensors in profile.growth_stages.items():
        for sensor_name, threshold in sensors.items():
            db.add(ThresholdModel(
                growth_stage=stage_name,
                sensor_name=sensor_name,
                min_value=threshold.min,
                max_value=threshold.max,
                optimal_min=threshold.optimal_min,
                optimal_max=threshold.optimal_max,
            ))

    for name, sd in profile.sensors.items():
        db.add(SensorDefModel(
            name=name,
            unit=sd.unit,
            description=sd.description,
        ))
    await db.commit()


async def build_kb_from_db(db: AsyncSession) -> KnowledgeBase:
    t_rows = (await db.execute(select(ThresholdModel))).scalars().all()
    s_rows = (await db.execute(select(SensorDefModel))).scalars().all()

    sensors: dict[str, SensorDef] = {}
    for r in s_rows:
        sensors[r.name] = SensorDef(r.name, r.unit, r.description, Threshold())

    stages: dict[str, dict[str, Threshold]] = {}
    for r in t_rows:
        stage = stages.setdefault(r.growth_stage, {})
        stage[r.sensor_name] = Threshold(
            min=r.min_value,
            max=r.max_value,
            optimal_min=r.optimal_min,
            optimal_max=r.optimal_max,
        )

    profile = CropProfile(name=TOMATO_PROFILE.name, growth_stages=stages, sensors=sensors)
    return KnowledgeBase(profile)


async def rebuild_engine_from_db(db: AsyncSession):
    kb = await build_kb_from_db(db)
    await rebuild_engine_with_kb(kb, db)


async def update_threshold(db: AsyncSession, growth_stage: str, sensor_name: str, data: dict) -> bool:
    result = await db.execute(
        select(ThresholdModel).where(
            ThresholdModel.growth_stage == growth_stage,
            ThresholdModel.sensor_name == sensor_name,
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        return False

    if "min" in data: row.min_value = data["min"]
    if "max" in data: row.max_value = data["max"]
    if "optimal_min" in data: row.optimal_min = data["optimal_min"]
    if "optimal_max" in data: row.optimal_max = data["optimal_max"]
    await db.commit()
    await rebuild_engine_from_db(db)
    return True


async def add_growth_stage(db: AsyncSession, stage_name: str, thresholds: dict[str, dict] | None = None) -> bool:
    existing = await db.execute(
        select(ThresholdModel.growth_stage).where(ThresholdModel.growth_stage == stage_name).limit(1)
    )
    if existing.scalar_one_or_none():
        return False

    sensor_names = (await db.execute(select(SensorDefModel.name))).scalars().all()
    for sn in sensor_names:
        t = thresholds.get(sn, {}) if thresholds else {}
        db.add(ThresholdModel(
            growth_stage=stage_name,
            sensor_name=sn,
            min_value=t.get("min"),
            max_value=t.get("max"),
            optimal_min=t.get("optimal_min"),
            optimal_max=t.get("optimal_max"),
        ))
    await db.commit()
    await rebuild_engine_from_db(db)
    return True


async def delete_growth_stage(db: AsyncSession, stage_name: str) -> bool:
    result = await db.execute(select(ThresholdModel).where(ThresholdModel.growth_stage == stage_name))
    rows = result.scalars().all()
    if not rows:
        return False
    for row in rows:
        await db.delete(row)
    await db.commit()
    await rebuild_engine_from_db(db)
    return True


async def add_sensor_def(db: AsyncSession, name: str, unit: str, description: str) -> bool:
    existing = await db.execute(select(SensorDefModel).where(SensorDefModel.name == name).limit(1))
    if existing.scalar_one_or_none():
        return False
    db.add(SensorDefModel(name=name, unit=unit, description=description))
    stages = (await db.execute(select(ThresholdModel.growth_stage).distinct())).scalars().all()
    for stage in stages:
        db.add(ThresholdModel(growth_stage=stage, sensor_name=name))
    await db.commit()
    await rebuild_engine_from_db(db)
    return True


async def update_sensor_def(db: AsyncSession, name: str, data: dict) -> bool:
    result = await db.execute(select(SensorDefModel).where(SensorDefModel.name == name))
    row = result.scalar_one_or_none()
    if row is None:
        return False
    if "unit" in data: row.unit = data["unit"]
    if "description" in data: row.description = data["description"]
    await db.commit()
    await rebuild_engine_from_db(db)
    return True


async def delete_sensor_def(db: AsyncSession, name: str) -> bool:
    result = await db.execute(select(SensorDefModel).where(SensorDefModel.name == name))
    row = result.scalar_one_or_none()
    if row is None:
        return False
    thresholds = (await db.execute(select(ThresholdModel).where(ThresholdModel.sensor_name == name))).scalars().all()
    for t in thresholds:
        await db.delete(t)
    await db.delete(row)
    await db.commit()
    await rebuild_engine_from_db(db)
    return True
