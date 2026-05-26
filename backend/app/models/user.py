from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from ..core.roles import UserRole

if TYPE_CHECKING:
    from .member import Member

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, values_callable=lambda e: [v.value for v in e]), default=UserRole.MEMBER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # 🔗 Usa string para evitar import circular. SQLAlchemy lo resuelve en runtime.
    members: Mapped[list[Member]] = relationship("Member", back_populates="user", lazy="selectin")