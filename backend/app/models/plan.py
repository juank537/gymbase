from __future__ import annotations
from sqlalchemy import String, Integer, Float, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base
from enum import StrEnum


class PlanStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    features: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[PlanStatus] = mapped_column(
        SAEnum(PlanStatus, values_callable=lambda e: [v.value for v in e]),
        default=PlanStatus.ACTIVE,
    )