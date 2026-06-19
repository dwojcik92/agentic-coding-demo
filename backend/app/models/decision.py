from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DecisionRecord(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    decision_type: Mapped[str] = mapped_column(String(30), index=True)
    action: Mapped[str] = mapped_column(Text)
    priority: Mapped[int] = mapped_column(Integer)
    explanation: Mapped[str] = mapped_column(Text)
    growth_stage: Mapped[str] = mapped_column(String(20))
    sensor_snapshot: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
