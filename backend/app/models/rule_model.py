from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class RuleModel(Base):
    __tablename__ = "rules"

    name: Mapped[str] = mapped_column(String(100), primary_key=True)
    description: Mapped[str] = mapped_column(Text)
    decision_type: Mapped[str] = mapped_column(String(30))
    priority: Mapped[int] = mapped_column(Integer)
    action: Mapped[str] = mapped_column(Text)
    condition_operator: Mapped[str] = mapped_column(String(5))
    conditions: Mapped[str] = mapped_column(Text)
