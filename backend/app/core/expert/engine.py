from app.core.expert.knowledge_base import KnowledgeBase
from app.core.expert.rules import Decision, Rule, DecisionType


class ExpertEngine:
    def __init__(self, knowledge_base: KnowledgeBase, rules: list[Rule]):
        self.kb = knowledge_base
        self.rules = rules

    def evaluate(self, sensor_data: dict[str, float], growth_stage: str = "fruiting") -> dict:
        sensor_evaluations = {}
        for name in sensor_data:
            sensor_evaluations[name] = self.kb.evaluate_sensor(
                name, sensor_data[name], growth_stage
            )

        decisions: list[Decision] = []
        for rule in self.rules:
            decision = rule.evaluate(sensor_data)
            if decision is not None:
                decisions.append(decision)

        decisions.sort(key=lambda d: d.priority)

        return {
            "sensor_evaluations": sensor_evaluations,
            "decisions": decisions,
            "growth_stage": growth_stage,
            "crop": self.kb.profile.name,
        }

    def get_decision_by_type(
        self, sensor_data: dict[str, float], growth_stage: str = "fruiting"
    ) -> dict[DecisionType, list[Decision]]:
        result = self.evaluate(sensor_data, growth_stage)
        grouped: dict[DecisionType, list[Decision]] = {}
        for d in result["decisions"]:
            grouped.setdefault(d.type, []).append(d)
        return grouped
