from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from enum import StrEnum

if TYPE_CHECKING:
    from .member import Member
    from .plan import Plan


class MembershipStatus(StrEnum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class Membership(Base):
    __tablename__ = "memberships"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), nullable=False)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), nullable=False)
    start_date: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[MembershipStatus] = mapped_column(
        SAEnum(MembershipStatus, values_callable=lambda e: [v.value for v in e]),
        default=MembershipStatus.ACTIVE,
    )

    member: Mapped[Member] = relationship("Member", back_populates="memberships", lazy="joined")
    plan: Mapped[Plan] = relationship("Plan", lazy="joined")