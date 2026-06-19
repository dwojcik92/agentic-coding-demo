from fastapi import APIRouter

from app.services.expert_service import get_engine

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
