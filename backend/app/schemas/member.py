from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from ..models.member import MemberStatus

class MemberCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str | None = Field(None, pattern=r"^\+?\d{7,15}$")
    status: MemberStatus = MemberStatus.TRIAL

class MemberUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=100)
    phone: str | None = Field(None, pattern=r"^\+?\d{7,15}$")
    status: MemberStatus | None = None
    ended_at: datetime | None = None  # Permite fecha de baja explícita

class MemberResponse(BaseModel):
    id: int
    full_name: str
    phone: str | None
    status: MemberStatus
    joined_at: datetime
    ended_at: datetime | None
    model_config = ConfigDict(from_attributes=True)

class MemberListResponse(BaseModel):
    items: list[MemberResponse]
    total: int
    page: int
    limit: int