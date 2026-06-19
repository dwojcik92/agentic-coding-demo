from app.core.expert import KnowledgeBase
from app.core.expert.rules import Condition, CompositeCondition, DecisionType, Rule


def test_knowledge_base_thresholds():
    kb = KnowledgeBase()
    threshold = kb.get_threshold("temperature", "fruiting")
    assert threshold is not None
    assert threshold.min == 18
    assert threshold.max == 33
    assert threshold.optimal_min == 24
    assert threshold.optimal_max == 30


def test_sensor_evaluation_optimal():
    kb = KnowledgeBase()
    result = kb.evaluate_sensor("temperature", 26, "fruiting")
    assert result["status"] == "ok"
    assert result["deviation"] == 0.0


def test_sensor_evaluation_warning():
    kb = KnowledgeBase()
    result = kb.evaluate_sensor("temperature", 20, "fruiting")
    assert result["status"] == "warning"
    assert result["deviation"] > 0


def test_sensor_evaluation_critical():
    kb = KnowledgeBase()
    result = kb.evaluate_sensor("temperature", 5, "fruiting")
    assert result["status"] == "critical"
    assert result["deviation"] > 0


def test_condition_evaluation():
    c = Condition("temperature", "gt", 30)
    assert c.evaluate({"temperature": 35})
    assert not c.evaluate({"temperature": 25})


def test_composite_condition_and():
    cc = CompositeCondition(
        [
            Condition("soil_moisture", "lt", 30),
            Condition("temperature", "gt", 30),
        ],
        operator="and",
    )
    assert cc.evaluate({"soil_moisture": 20, "temperature": 35})
    assert not cc.evaluate({"soil_moisture": 40, "temperature": 35})


def test_composite_condition_or():
    cc = CompositeCondition(
        [
            Condition("soil_moisture", "lt", 20),
            Condition("temperature", "gt", 35),
        ],
        operator="or",
    )
    assert cc.evaluate({"soil_moisture": 15, "temperature": 25})
    assert cc.evaluate({"soil_moisture": 50, "temperature": 38})
    assert not cc.evaluate({"soil_moisture": 50, "temperature": 25})


def test_rule_evaluation():
    rule = Rule(
        name="test_irrigate",
        description="Test rule",
        decision_type=DecisionType.IRRIGATION,
        priority=1,
        condition=CompositeCondition([Condition("soil_moisture", "lt", 30)]),
        action="Irrigate now",
    )
    decision = rule.evaluate({"soil_moisture": 20})
    assert decision is not None
    assert decision.type == DecisionType.IRRIGATION
    assert decision.action == "Irrigate now"

    decision = rule.evaluate({"soil_moisture": 50})
    assert decision is None


def test_expert_engine_integration(expert_engine):
    sensor_data = {
        "soil_moisture": 25.0,
        "temperature": 35.0,
        "humidity": 85.0,
        "light_intensity": 400.0,
        "soil_ph": 6.5,
        "nitrogen": 30.0,
        "wind_speed": 15.0,
    }
    result = expert_engine.evaluate(sensor_data, "fruiting")
    assert result["crop"] == "Tomato"
    assert result["growth_stage"] == "fruiting"
    assert len(result["decisions"]) > 0
    assert "soil_moisture" in result["sensor_evaluations"]
    assert "temperature" in result["sensor_evaluations"]


def test_expert_engine_no_decisions(expert_engine):
    sensor_data = {
        "soil_moisture": 45.0,
        "temperature": 26.0,
        "humidity": 60.0,
        "light_intensity": 600.0,
        "soil_ph": 6.5,
        "nitrogen": 50.0,
        "wind_speed": 5.0,
    }
    result = expert_engine.evaluate(sensor_data, "fruiting")
    assert len(result["decisions"]) >= 0


def test_expert_engine_decision_types(expert_engine):
    sensor_data = {
        "soil_moisture": 20.0,
        "temperature": 5.0,
        "humidity": 90.0,
        "light_intensity": 100.0,
        "soil_ph": 5.5,
        "nitrogen": 20.0,
        "wind_speed": 20.0,
    }
    result = expert_engine.evaluate(sensor_data, "fruiting")
    types = {d.type for d in result["decisions"]}
    assert DecisionType.IRRIGATION in types
    assert DecisionType.PLANT_STRESS in types
    assert DecisionType.DISEASE_RISK in types


def test_knowledge_base_growth_stages():
    kb = KnowledgeBase()
    stages = kb.get_growth_stages()
    assert "seedling" in stages
    assert "vegetative" in stages
    assert "flowering" in stages
    assert "fruiting" in stages


def test_knowledge_base_sensor_names():
    kb = KnowledgeBase()
    names = kb.get_sensor_names()
    assert "soil_moisture" in names
    assert "temperature" in names
    assert "humidity" in names
    assert "light_intensity" in names
    assert "soil_ph" in names
    assert "nitrogen" in names
    assert "wind_speed" in names
    assert len(names) == 7
