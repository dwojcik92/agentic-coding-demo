from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.rule_service import get_all_rules, create_rule, update_rule, delete_rule, get_engine
from app.services.kb_service import (
    update_threshold, add_growth_stage, delete_growth_stage,
    add_sensor_def, update_sensor_def, delete_sensor_def,
)

router = APIRouter(prefix="/api/v1", tags=["knowledge"])


# ── Rules ──

@router.get("/rules")
async def list_rules():
    engine = get_engine()
    output = []
    for rule in engine.rules:
        output.append({
            "name": rule.name,
            "description": rule.description,
            "decision_type": rule.decision_type.value,
            "priority": rule.priority,
            "action": rule.action,
            "condition": {
                "operator": rule.condition.operator,
                "conditions": [
                    {"sensor": c.sensor, "operator": c.operator, "value": c.value}
                    for c in rule.condition.conditions
                ],
            },
        })
    return {"rules": output}


@router.post("/rules", status_code=201)
async def add_rule(data: dict, db: AsyncSession = Depends(get_db)):
    engine = get_engine()
    if any(r.name == data.get("name") for r in engine.rules):
        raise HTTPException(409, f"Rule '{data['name']}' already exists")
    return await create_rule(db, data)


@router.put("/rules/{name}")
async def edit_rule(name: str, data: dict, db: AsyncSession = Depends(get_db)):
    result = await update_rule(db, name, data)
    if result is None:
        raise HTTPException(404, f"Rule '{name}' not found")
    return result


@router.delete("/rules/{name}")
async def remove_rule(name: str, db: AsyncSession = Depends(get_db)):
    deleted = await delete_rule(db, name)
    if not deleted:
        raise HTTPException(404, f"Rule '{name}' not found")
    return {"message": f"Rule '{name}' deleted"}


# ── Knowledge Base ──

@router.get("/knowledge-base")
async def get_knowledge_base():
    engine = get_engine()
    kb = engine.kb
    stages = {}
    for stage_name in kb.get_growth_stages():
        stages[stage_name] = {}
        for sensor_name in kb.get_sensor_names():
            t = kb.get_threshold(sensor_name, stage_name)
            if t:
                stages[stage_name][sensor_name] = {
                    "min": t.min,
                    "max": t.max,
                    "optimal_min": t.optimal_min,
                    "optimal_max": t.optimal_max,
                }
    return {
        "crop": kb.profile.name,
        "sensors": {
            name: {"name": sd.name, "unit": sd.unit, "description": sd.description}
            for name, sd in kb.profile.sensors.items()
        },
        "growth_stages": stages,
    }


@router.put("/knowledge-base/thresholds/{stage}/{sensor}")
async def edit_threshold(stage: str, sensor: str, data: dict, db: AsyncSession = Depends(get_db)):
    ok = await update_threshold(db, stage, sensor, data)
    if not ok:
        raise HTTPException(404, f"Threshold for {stage}/{sensor} not found")
    return {"message": "Threshold updated"}


@router.post("/knowledge-base/stages/{stage}")
async def create_stage(stage: str, data: dict | None = None, db: AsyncSession = Depends(get_db)):
    thresholds = (data or {}).get("thresholds") if data else None
    ok = await add_growth_stage(db, stage, thresholds)
    if not ok:
        raise HTTPException(409, f"Stage '{stage}' already exists")
    return {"message": f"Stage '{stage}' created"}


@router.delete("/knowledge-base/stages/{stage}")
async def remove_stage(stage: str, db: AsyncSession = Depends(get_db)):
    ok = await delete_growth_stage(db, stage)
    if not ok:
        raise HTTPException(404, f"Stage '{stage}' not found")
    return {"message": f"Stage '{stage}' deleted"}


@router.post("/knowledge-base/sensors")
async def create_sensor(data: dict, db: AsyncSession = Depends(get_db)):
    ok = await add_sensor_def(db, data["name"], data.get("unit", ""), data.get("description", ""))
    if not ok:
        raise HTTPException(409, f"Sensor '{data['name']}' already exists")
    return {"message": f"Sensor '{data['name']}' created"}


@router.put("/knowledge-base/sensors/{name}")
async def edit_sensor(name: str, data: dict, db: AsyncSession = Depends(get_db)):
    ok = await update_sensor_def(db, name, data)
    if not ok:
        raise HTTPException(404, f"Sensor '{name}' not found")
    return {"message": f"Sensor '{name}' updated"}


@router.delete("/knowledge-base/sensors/{name}")
async def remove_sensor(name: str, db: AsyncSession = Depends(get_db)):
    ok = await delete_sensor_def(db, name)
    if not ok:
        raise HTTPException(404, f"Sensor '{name}' not found")
    return {"message": f"Sensor '{name}' deleted"}
