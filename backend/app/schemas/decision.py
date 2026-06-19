from datetime import datetime

from pydantic import BaseModel


class DecisionResponse(BaseModel):
    id: int
    decision_type: str
    action: str
    priority: int
    explanation: str
    growth_stage: str
    sensor_snapshot: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class DecisionOutput(BaseModel):
    type: str
    action: str
    priority: int
    explanation: str
    sensor_readings: dict[str, float]
    conditions_met: list[str]


class SensorEval(BaseModel):
    status: str
    value: float
    deviation: float
    unit: str
    sensor_name: str
    threshold: dict
    detail: str


class ExpertResult(BaseModel):
    sensor_evaluations: dict[str, SensorEval]
    decisions: list[DecisionOutput]
    growth_stage: str
    crop: str
