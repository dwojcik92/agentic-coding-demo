import json
from copy import deepcopy

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.expert import ExpertEngine, KnowledgeBase
from app.core.expert.rules import build_tomato_rules, CompositeCondition, Condition, DecisionType, Rule
from app.models.rule_model import RuleModel

_engine: ExpertEngine | None = None


def get_engine() -> ExpertEngine:
    global _engine
    if _engine is None:
        kb = KnowledgeBase()
        rules = build_tomato_rules()
        _engine = ExpertEngine(kb, rules)
    return _engine


def set_engine(engine: ExpertEngine | None):
    global _engine
    _engine = engine


def rebuild_engine(db_rules: list[Rule]):
    kb = KnowledgeBase()
    rules = db_rules if db_rules else build_tomato_rules()
    set_engine(ExpertEngine(kb, rules))


def _deserialize_rule(row: RuleModel) -> Rule:
    conds = json.loads(row.conditions)
    rule = Rule(
        name=row.name,
        description=row.description,
        decision_type=DecisionType(row.decision_type),
        priority=row.priority,
        action=row.action,
        condition=CompositeCondition(
            conditions=[Condition(c["sensor"], c["operator"], c["value"]) for c in conds],
            operator=row.condition_operator,
        ),
    )
    return rule


def _rule_to_dict(rule: Rule) -> dict:
    return {
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
    }


async def init_rules(db: AsyncSession):
    result = await db.execute(select(RuleModel))
    rows = result.scalars().all()
    if rows:
        rules = [_deserialize_rule(r) for r in rows]
        rebuild_engine(rules)
    else:
        builtin = build_tomato_rules()
        for rule in builtin:
            row = RuleModel(
                name=rule.name,
                description=rule.description,
                decision_type=rule.decision_type.value,
                priority=rule.priority,
                action=rule.action,
                condition_operator=rule.condition.operator,
                conditions=json.dumps([
                    {"sensor": c.sensor, "operator": c.operator, "value": c.value}
                    for c in rule.condition.conditions
                ]),
            )
            db.add(row)
        await db.commit()
        rebuild_engine(builtin)


async def get_all_rules(db: AsyncSession) -> list[dict]:
    engine = get_engine()
    return [_rule_to_dict(r) for r in engine.rules]


async def create_rule(db: AsyncSession, data: dict) -> dict:
    conditions_json = json.dumps(data["conditions"])
    row = RuleModel(
        name=data["name"],
        description=data["description"],
        decision_type=data["decision_type"],
        priority=data["priority"],
        action=data["action"],
        condition_operator=data["condition_operator"],
        conditions=conditions_json,
    )
    db.add(row)
    await db.commit()

    rules = await _load_all(db)
    rebuild_engine(rules)
    return data


async def update_rule(db: AsyncSession, name: str, data: dict) -> dict | None:
    result = await db.execute(select(RuleModel).where(RuleModel.name == name))
    row = result.scalar_one_or_none()
    if row is None:
        return None

    row.description = data.get("description", row.description)
    row.decision_type = data.get("decision_type", row.decision_type)
    row.priority = data.get("priority", row.priority)
    row.action = data.get("action", row.action)
    row.condition_operator = data.get("condition_operator", row.condition_operator)
    if "conditions" in data:
        row.conditions = json.dumps(data["conditions"])
    await db.commit()

    rules = await _load_all(db)
    rebuild_engine(rules)
    return data


async def delete_rule(db: AsyncSession, name: str) -> bool:
    result = await db.execute(select(RuleModel).where(RuleModel.name == name))
    row = result.scalar_one_or_none()
    if row is None:
        return False
    await db.delete(row)
    await db.commit()

    rules = await _load_all(db)
    rebuild_engine(rules)
    return True


async def _load_all(db: AsyncSession) -> list[Rule]:
    result = await db.execute(select(RuleModel))
    rows = result.scalars().all()
    return [_deserialize_rule(r) for r in rows]
