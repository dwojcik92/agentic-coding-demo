import random


class SensorSimulator:
    def __init__(self, base_values: dict[str, float] | None = None):
        self.base = base_values or {
            "soil_moisture": 35.0,
            "temperature": 22.0,
            "humidity": 60.0,
            "light_intensity": 500.0,
            "soil_ph": 6.5,
            "nitrogen": 50.0,
            "wind_speed": 5.0,
        }
        self.time_of_day = 0  # hours since midnight simulation

    def generate(self) -> dict[str, float]:
        self.time_of_day = (self.time_of_day + 1) % 24
        t = self.time_of_day

        diurnal_temp = (
            15 + 15 * ((t - 6) / 12)
            if 6 <= t <= 18
            else 15 + 15 * ((24 - (t - 6)) / 12)
            if t < 6
            else 15 + 15 * ((24 - (t + 6)) / 12)
        )
        temp_base = max(10, min(38, diurnal_temp))

        light = max(
            0, 800 * ((t - 6) / 10) if 6 <= t <= 16 else 800 * ((20 - t) / 4) if 16 < t <= 20 else 0
        )

        moisture_decay = -0.3
        moisture = self.base.get("soil_moisture", 35) + moisture_decay + random.gauss(0, 0.2)
        moisture = max(15, min(65, moisture))
        self.base["soil_moisture"] = moisture

        readings = {
            "soil_moisture": round(moisture, 1),
            "temperature": round(temp_base + random.gauss(0, 1.0), 1),
            "humidity": round(55 - 20 * ((temp_base - 15) / 20) + random.gauss(0, 5), 1),
            "light_intensity": round(light + random.gauss(0, 30), 1),
            "soil_ph": round(self.base.get("soil_ph", 6.5) + random.gauss(0, 0.03), 2),
            "nitrogen": round(self.base.get("nitrogen", 50) + random.gauss(0, 0.5), 1),
            "wind_speed": round(max(0, self.base.get("wind_speed", 5) + random.gauss(0, 1.0)), 1),
        }

        self.base["temperature"] = temp_base
        return readings
