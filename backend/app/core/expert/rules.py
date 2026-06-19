from dataclasses import dataclass, field
from enum import Enum


class DecisionType(str, Enum):
    IRRIGATION = "irrigation"
    FERTILIZATION = "fertilization"
    PLANT_STRESS = "plant_stress"
    DISEASE_RISK = "disease_risk"
    GROWTH_QUALITY = "growth_quality"
    OBSERVATION = "observation"


@dataclass
class Condition:
    sensor: str
    operator: str
    value: float

    def evaluate(self, sensor_data: dict[str, float]) -> bool:
        actual = sensor_data.get(self.sensor)
        if actual is None:
            return False
        if self.operator == "lt":
            return actual < self.value
        elif self.operator == "le":
            return actual <= self.value
        elif self.operator == "eq":
            return actual == self.value
        elif self.operator == "ge":
            return actual >= self.value
        elif self.operator == "gt":
            return actual > self.value
        elif self.operator == "ne":
            return actual != self.value
        elif self.operator == "between":
            return False
        return False

    def explain(self, sensor_data: dict[str, float]) -> str:
        actual = sensor_data.get(self.sensor, 0)
        op_map = {"lt": "<", "le": "<=", "eq": "=", "ge": ">=", "gt": ">", "ne": "!="}
        op_str = op_map.get(self.operator, self.operator)
        return f"{self.sensor} ({actual}) {op_str} {self.value}"


@dataclass
class CompositeCondition:
    conditions: list[Condition] = field(default_factory=list)
    operator: str = "and"

    def evaluate(self, sensor_data: dict[str, float]) -> bool:
        if self.operator == "and":
            return all(c.evaluate(sensor_data) for c in self.conditions)
        elif self.operator == "or":
            return any(c.evaluate(sensor_data) for c in self.conditions)
        return False

    def explain(self, sensor_data: dict[str, float]) -> str:
        parts = [c.explain(sensor_data) for c in self.conditions]
        sep = f" {self.operator} "
        return sep.join(parts)


@dataclass
class Decision:
    type: DecisionType
    action: str
    priority: int  # 1=urgent, 2=high, 3=medium, 4=low
    explanation: str
    sensor_readings: dict[str, float]
    conditions_met: list[str]


@dataclass
class Rule:
    name: str
    description: str
    decision_type: DecisionType
    priority: int
    condition: CompositeCondition
    action: str

    def evaluate(self, sensor_data: dict[str, float]) -> Decision | None:
        if not self.condition.evaluate(sensor_data):
            return None
        return Decision(
            type=self.decision_type,
            action=self.action,
            priority=self.priority,
            explanation=self._build_explanation(sensor_data),
            sensor_readings={k: v for k, v in sensor_data.items()},
            conditions_met=self._conditions_met(sensor_data),
        )

    def _build_explanation(self, sensor_data: dict[str, float]) -> str:
        parts = [f"Rule '{self.name}': {self.description}"]
        parts.append(f"Conditions met: {self.condition.explain(sensor_data)}")
        parts.append(f"Recommendation: {self.action}")
        return " | ".join(parts)

    def _conditions_met(self, sensor_data: dict[str, float]) -> list[str]:
        return [c.explain(sensor_data) for c in self.condition.conditions]


# Domain-specific builder for tomato rules
def build_tomato_rules() -> list[Rule]:
    return [
        # --- IRRIGATION ---
        Rule(
            name="irrigate_low_moisture",
            description="Soil moisture is below optimal range",
            decision_type=DecisionType.IRRIGATION,
            priority=1,
            condition=CompositeCondition(
                [
                    Condition("soil_moisture", "lt", 30),
                ]
            ),
            action="Irrigate immediately: apply 20-30mm of water. Soil moisture is critically low for tomato development.",
        ),
        Rule(
            name="irrigate_moderate_moisture",
            description="Soil moisture is below optimal but not critical",
            decision_type=DecisionType.IRRIGATION,
            priority=3,
            condition=CompositeCondition(
                [
                    Condition("soil_moisture", "ge", 30),
                    Condition("soil_moisture", "lt", 40),
                ]
            ),
            action="Irrigate: apply 10-15mm of water to bring soil moisture into optimal range (40-55%).",
        ),
        Rule(
            name="irrigate_high_temp",
            description="High temperature increases water demand",
            decision_type=DecisionType.IRRIGATION,
            priority=2,
            condition=CompositeCondition(
                [
                    Condition("temperature", "gt", 30),
                    Condition("soil_moisture", "lt", 45),
                ]
            ),
            action="Supplemental irrigation recommended: high temperature (>{30}°C) with sub-optimal moisture increases transpiration stress.",
        ),
        # --- FERTILIZATION ---
        Rule(
            name="fertilize_low_nitrogen",
            description="Nitrogen level is below optimal",
            decision_type=DecisionType.FERTILIZATION,
            priority=2,
            condition=CompositeCondition(
                [
                    Condition("nitrogen", "lt", 40),
                ]
            ),
            action="Apply nitrogen fertilizer: current level ({N} mg/kg) is below the optimal range (40-60 mg/kg). Use balanced NPK 10-10-10 at 150 kg/ha.",
        ),
        Rule(
            name="fertilize_high_nitrogen",
            description="Nitrogen is excessive - risk of lush growth and disease",
            decision_type=DecisionType.FERTILIZATION,
            priority=3,
            condition=CompositeCondition(
                [
                    Condition("nitrogen", "gt", 80),
                ]
            ),
            action="Reduce nitrogen application: levels ({N} mg/kg) exceed optimal. Switch to low-nitrogen or potassium-rich fertilizer to balance.",
        ),
        Rule(
            name="fertilize_ph_off",
            description="Soil pH affects nutrient availability",
            decision_type=DecisionType.FERTILIZATION,
            priority=3,
            condition=CompositeCondition(
                [
                    Condition("soil_ph", "lt", 6.0),
                ]
            ),
            action="Apply lime to raise soil pH: current pH ({pH}) is below 6.0, limiting nutrient availability. Target pH 6.0-6.8.",
        ),
        # --- PLANT STRESS ---
        Rule(
            name="stress_high_temp",
            description="Temperature exceeds optimal range",
            decision_type=DecisionType.PLANT_STRESS,
            priority=2,
            condition=CompositeCondition(
                [
                    Condition("temperature", "gt", 32),
                ]
            ),
            action="Heat stress detected: temperature ({T}°C) exceeds 32°C. Consider shade cloth, increase irrigation, or apply anti-transpirant.",
        ),
        Rule(
            name="stress_low_temp",
            description="Temperature below optimal for growth",
            decision_type=DecisionType.PLANT_STRESS,
            priority=2,
            condition=CompositeCondition(
                [
                    Condition("temperature", "lt", 15),
                ]
            ),
            action="Cold stress detected: temperature ({T}°C) is below 15°C. Growth will be stunted. Consider row covers or greenhouse heating.",
        ),
        Rule(
            name="stress_wind",
            description="High wind causes physical and transpiration stress",
            decision_type=DecisionType.PLANT_STRESS,
            priority=3,
            condition=CompositeCondition(
                [
                    Condition("wind_speed", "gt", 12),
                ]
            ),
            action="Wind stress detected: wind speed ({W} km/h) exceeds 12 km/h. Plants may experience physical damage and increased transpiration.",
        ),
        Rule(
            name="stress_combined",
            description="Multiple sub-optimal factors indicate cumulative stress",
            decision_type=DecisionType.PLANT_STRESS,
            priority=2,
            condition=CompositeCondition(
                [
                    Condition("soil_moisture", "lt", 35),
                    Condition("temperature", "gt", 28),
                ]
            ),
            action="Combined drought-heat stress: low moisture ({M}%) and high temperature ({T}°C) compound each other. Prioritize irrigation and consider temporary shading.",
        ),
        # --- DISEASE RISK ---
        Rule(
            name="disease_high_humidity_moisture",
            description="High humidity with moist soil favors fungal diseases",
            decision_type=DecisionType.DISEASE_RISK,
            priority=2,
            condition=CompositeCondition(
                [
                    Condition("humidity", "gt", 80),
                    Condition("soil_moisture", "gt", 50),
                ]
            ),
            action="High fungal disease risk: humidity >80% with moist soil. Monitor for early blight, late blight, and septoria. Consider preventive fungicide application.",
        ),
        Rule(
            name="disease_humidity_warm",
            description="Warm and humid conditions favor pathogens",
            decision_type=DecisionType.DISEASE_RISK,
            priority=2,
            condition=CompositeCondition(
                [
                    Condition("humidity", "gt", 75),
                    Condition("temperature", "gt", 22),
                    Condition("temperature", "lt", 30),
                ]
            ),
            action="Moderate disease risk: warm-humid conditions (T={T}°C, RH={RH}%) favor bacterial spot and early blight. Improve air circulation, avoid overhead irrigation.",
        ),
        Rule(
            name="disease_leaf_wetness",
            description="Extended leaf wetness period from high humidity",
            decision_type=DecisionType.DISEASE_RISK,
            priority=3,
            condition=CompositeCondition(
                [
                    Condition("humidity", "gt", 85),
                ]
            ),
            action="Elevated disease pressure: relative humidity >85% creates extended leaf wetness. B light and septoria are favored. Scout twice weekly.",
        ),
        # --- GROWTH QUALITY ---
        Rule(
            name="growth_excellent",
            description="All key parameters in optimal range",
            decision_type=DecisionType.GROWTH_QUALITY,
            priority=4,
            condition=CompositeCondition(
                [
                    Condition("soil_moisture", "ge", 40),
                    Condition("soil_moisture", "le", 55),
                    Condition("temperature", "ge", 24),
                    Condition("temperature", "le", 30),
                    Condition("humidity", "ge", 55),
                    Condition("humidity", "le", 70),
                    Condition("light_intensity", "ge", 400),
                    Condition("nitrogen", "ge", 40),
                    Condition("nitrogen", "le", 60),
                ]
            ),
            action="Excellent growth conditions: all parameters are in optimal range for tomato fruiting stage.",
        ),
        Rule(
            name="growth_good",
            description="Most parameters adequate but some sub-optimal",
            decision_type=DecisionType.GROWTH_QUALITY,
            priority=4,
            condition=CompositeCondition(
                [
                    Condition("temperature", "ge", 18),
                    Condition("temperature", "le", 33),
                    Condition("soil_moisture", "ge", 25),
                    Condition("soil_moisture", "le", 60),
                ]
            ),
            action="Adequate growth conditions: temperature and moisture are within survivable ranges. Check individual sensor recommendations for optimization.",
        ),
        Rule(
            name="growth_poor",
            description="Critical parameters outside bounds",
            decision_type=DecisionType.GROWTH_QUALITY,
            priority=1,
            condition=CompositeCondition(
                [
                    Condition("temperature", "lt", 10),
                ]
            ),
            action="Poor growth conditions: temperature ({T}°C) is critically low. Tomato growth ceases below 10°C. Take protective measures immediately.",
        ),
        # --- OBSERVATIONS ---
        Rule(
            name="observe_low_light",
            description="Light intensity may limit photosynthesis",
            decision_type=DecisionType.OBSERVATION,
            priority=4,
            condition=CompositeCondition(
                [
                    Condition("light_intensity", "lt", 200),
                ]
            ),
            action="Observation: low light ({L} W/m²) may reduce photosynthetic rate. Monitor for elongated growth and pale leaves. Consider supplemental lighting if persistent.",
        ),
        Rule(
            name="observe_ph_monitor",
            description="pH trending toward boundary",
            decision_type=DecisionType.OBSERVATION,
            priority=4,
            condition=CompositeCondition(
                [
                    Condition("soil_ph", "lt", 6.2),
                    Condition("soil_ph", "ge", 5.5),
                ]
            ),
            action="Observation: soil pH ({pH}) is approaching the lower bound. Monitor regularly and prepare corrective lime application if it drops below 5.8.",
        ),
        Rule(
            name="observe_nitrogen_trend",
            description="Nitrogen in upper range",
            decision_type=DecisionType.OBSERVATION,
            priority=4,
            condition=CompositeCondition(
                [
                    Condition("nitrogen", "ge", 60),
                    Condition("nitrogen", "le", 80),
                ]
            ),
            action="Observation: nitrogen level ({N} mg/kg) is above optimal. Monitor for excessive vegetative growth at expense of fruit development.",
        ),
        Rule(
            name="observe_high_humidity_ventilation",
            description="High humidity suggests ventilation need",
            decision_type=DecisionType.OBSERVATION,
            priority=3,
            condition=CompositeCondition(
                [
                    Condition("humidity", "gt", 70),
                    Condition("humidity", "le", 80),
                ]
            ),
            action="Observation: humidity ({RH}%) is elevated. Consider improving ventilation to prevent disease conditions. Monitor leaf wetness.",
        ),
    ]
