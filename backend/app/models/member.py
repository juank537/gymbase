from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from enum import StrEnum

if TYPE_CHECKING:
    from .user import User

class MemberStatus(StrEnum):
    ACTIVE = "active"
    TRIAL = "trial"
    CANCELLED = "cancelled"
    SUSPENDED = "suspended"

class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[MemberStatus] = mapped_column(SAEnum(MemberStatus, values_callable=lambda e: [v.value for v in e]), default=MemberStatus.TRIAL)
    
    joined_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # 🔗 Usa string para evitar import circular
    user: Mapped[User] = relationship("User", back_populates="members", lazy="joined")