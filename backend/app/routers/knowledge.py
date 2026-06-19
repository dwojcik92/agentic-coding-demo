from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.rule_service import get_all_rules, create_rule, update_rule, delete_rule, get_engine

router = APIRouter(prefix="/api/v1", tags=["knowledge"])


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
    existing = [r for r in engine.rules if r.name == data.get("name")]
    if existing:
        raise HTTPException(409, f"Rule '{data['name']}' already exists")
    result = await create_rule(db, data)
    return result


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
