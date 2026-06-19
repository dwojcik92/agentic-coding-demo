from dataclasses import dataclass
from typing import Dict


@dataclass
class Fact:
    name: str
    value: float
    unit: str
    description: str


@dataclass
class Threshold:
    min: float | None = None
    max: float | None = None
    optimal_min: float | None = None
    optimal_max: float | None = None

    def is_within_bounds(self, value: float) -> bool:
        if self.min is not None and value < self.min:
            return False
        if self.max is not None and value > self.max:
            return False
        return True

    def is_optimal(self, value: float) -> bool:
        if self.optimal_min is not None and value < self.optimal_min:
            return False
        if self.optimal_max is not None and value > self.optimal_max:
            return False
        return True

    def deviation(self, value: float) -> float:
        if self.optimal_min is not None and value < self.optimal_min:
            return self.optimal_min - value
        if self.optimal_max is not None and value > self.optimal_max:
            return value - self.optimal_max
        return 0.0


@dataclass
class SensorDef:
    name: str
    unit: str
    description: str
    threshold: Threshold


@dataclass
class CropProfile:
    name: str
    growth_stages: Dict[str, Dict[str, Threshold]]
    sensors: Dict[str, SensorDef]


TOMATO_PROFILE = CropProfile(
    name="Tomato",
    growth_stages={
        "seedling": {
            "soil_moisture": Threshold(min=20, max=40, optimal_min=25, optimal_max=35),
            "temperature": Threshold(min=15, max=30, optimal_min=18, optimal_max=25),
            "humidity": Threshold(min=50, max=85, optimal_min=60, optimal_max=75),
            "light_intensity": Threshold(min=100, max=600, optimal_min=200, optimal_max=400),
            "soil_ph": Threshold(min=5.5, max=7.5, optimal_min=6.0, optimal_max=6.8),
            "nitrogen": Threshold(min=30, max=80, optimal_min=40, optimal_max=60),
            "wind_speed": Threshold(min=0, max=15, optimal_min=0, optimal_max=8),
        },
        "vegetative": {
            "soil_moisture": Threshold(min=25, max=50, optimal_min=30, optimal_max=45),
            "temperature": Threshold(min=18, max=32, optimal_min=22, optimal_max=28),
            "humidity": Threshold(min=50, max=80, optimal_min=55, optimal_max=70),
            "light_intensity": Threshold(min=200, max=900, optimal_min=400, optimal_max=700),
            "soil_ph": Threshold(min=5.5, max=7.5, optimal_min=6.0, optimal_max=6.8),
            "nitrogen": Threshold(min=40, max=100, optimal_min=55, optimal_max=80),
            "wind_speed": Threshold(min=0, max=18, optimal_min=0, optimal_max=10),
        },
        "flowering": {
            "soil_moisture": Threshold(min=30, max=55, optimal_min=35, optimal_max=50),
            "temperature": Threshold(min=18, max=35, optimal_min=22, optimal_max=30),
            "humidity": Threshold(min=40, max=75, optimal_min=50, optimal_max=65),
            "light_intensity": Threshold(min=300, max=1000, optimal_min=500, optimal_max=800),
            "soil_ph": Threshold(min=5.5, max=7.5, optimal_min=6.0, optimal_max=6.8),
            "nitrogen": Threshold(min=20, max=60, optimal_min=30, optimal_max=50),
            "wind_speed": Threshold(min=0, max=15, optimal_min=0, optimal_max=8),
        },
        "fruiting": {
            "soil_moisture": Threshold(min=30, max=60, optimal_min=40, optimal_max=55),
            "temperature": Threshold(min=18, max=33, optimal_min=24, optimal_max=30),
            "humidity": Threshold(min=45, max=80, optimal_min=55, optimal_max=70),
            "light_intensity": Threshold(min=300, max=1000, optimal_min=500, optimal_max=800),
            "soil_ph": Threshold(min=5.5, max=7.5, optimal_min=6.0, optimal_max=6.8),
            "nitrogen": Threshold(min=30, max=70, optimal_min=40, optimal_max=60),
            "wind_speed": Threshold(min=0, max=15, optimal_min=0, optimal_max=8),
        },
    },
    sensors={
        "soil_moisture": SensorDef(
            "soil_moisture", "%", "Volumetric soil water content", Threshold(min=0, max=100)
        ),
        "temperature": SensorDef(
            "temperature", "°C", "Air temperature at canopy level", Threshold(min=-10, max=50)
        ),
        "humidity": SensorDef("humidity", "%", "Relative air humidity", Threshold(min=0, max=100)),
        "light_intensity": SensorDef(
            "light_intensity",
            "W/m²",
            "Photosynthetically active radiation",
            Threshold(min=0, max=1200),
        ),
        "soil_ph": SensorDef("soil_ph", "pH", "Soil acidity", Threshold(min=0, max=14)),
        "nitrogen": SensorDef(
            "nitrogen", "mg/kg", "Soil nitrogen content", Threshold(min=0, max=200)
        ),
        "wind_speed": SensorDef(
            "wind_speed", "km/h", "Wind speed at 2m height", Threshold(min=0, max=100)
        ),
    },
)


class KnowledgeBase:
    def __init__(self, crop_profile: CropProfile | None = None):
        self.profile = crop_profile or TOMATO_PROFILE

    def get_sensor_def(self, sensor_name: str) -> SensorDef | None:
        return self.profile.sensors.get(sensor_name)

    def get_threshold(self, sensor_name: str, growth_stage: str) -> Threshold | None:
        stage = self.profile.growth_stages.get(growth_stage)
        if stage is None:
            return None
        return stage.get(sensor_name)

    def get_growth_stages(self) -> list[str]:
        return list(self.profile.growth_stages.keys())

    def get_sensor_names(self) -> list[str]:
        return list(self.profile.sensors.keys())

    def evaluate_sensor(self, sensor_name: str, value: float, growth_stage: str) -> dict:
        threshold = self.get_threshold(sensor_name, growth_stage)
        sensor_def = self.get_sensor_def(sensor_name)
        if threshold is None or sensor_def is None:
            return {"status": "unknown", "deviation": 0.0, "detail": "No threshold defined"}

        within_bounds = threshold.is_within_bounds(value)
        optimal = threshold.is_optimal(value)
        deviation = threshold.deviation(value)

        if not within_bounds:
            status = "critical"
        elif not optimal:
            status = "warning"
        else:
            status = "ok"

        return {
            "status": status,
            "value": value,
            "deviation": deviation,
            "unit": sensor_def.unit,
            "sensor_name": sensor_name,
            "threshold": {
                "min": threshold.min,
                "max": threshold.max,
                "optimal_min": threshold.optimal_min,
                "optimal_max": threshold.optimal_max,
            },
            "detail": self._detail_message(sensor_name, value, threshold, sensor_def),
        }

    def _detail_message(
        self, name: str, value: float, threshold: Threshold, sensor_def: SensorDef
    ) -> str:
        if not threshold.is_within_bounds(value):
            if threshold.min is not None and value < threshold.min:
                return f"{sensor_def.description} ({value}{sensor_def.unit}) is BELOW minimum {threshold.min}{sensor_def.unit}"
            if threshold.max is not None and value > threshold.max:
                return f"{sensor_def.description} ({value}{sensor_def.unit}) is ABOVE maximum {threshold.max}{sensor_def.unit}"
        if not threshold.is_optimal(value):
            if threshold.optimal_min is not None and value < threshold.optimal_min:
                return f"{sensor_def.description} ({value}{sensor_def.unit}) is below optimal range ({threshold.optimal_min}-{threshold.optimal_max}{sensor_def.unit})"
            if threshold.optimal_max is not None and value > threshold.optimal_max:
                return f"{sensor_def.description} ({value}{sensor_def.unit}) is above optimal range ({threshold.optimal_min}-{threshold.optimal_max}{sensor_def.unit})"
        return f"{sensor_def.description} ({value}{sensor_def.unit}) is within optimal range ({threshold.optimal_min}-{threshold.optimal_max}{sensor_def.unit})"
