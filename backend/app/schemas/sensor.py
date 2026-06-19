from datetime import datetime

from pydantic import BaseModel


class SensorReadingBase(BaseModel):
    sensor_name: str
    value: float
    unit: str
    timestamp: datetime | None = None


class SensorReadingCreate(SensorReadingBase):
    pass


class SensorReadingResponse(SensorReadingBase):
    id: int

    model_config = {"from_attributes": True}


class SensorBatch(BaseModel):
    readings: dict[str, float]
    growth_stage: str = "fruiting"
