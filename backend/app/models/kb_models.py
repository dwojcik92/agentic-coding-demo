from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ThresholdModel(Base):
    __tablename__ = "thresholds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    growth_stage: Mapped[str] = mapped_column(String(30), index=True)
    sensor_name: Mapped[str] = mapped_column(String(50))
    min_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    optimal_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    optimal_max: Mapped[float | None] = mapped_column(Float, nullable=True)


class SensorDefModel(Base):
    __tablename__ = "sensor_defs"

    name: Mapped[str] = mapped_column(String(50), primary_key=True)
    unit: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text)
