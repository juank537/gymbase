from pydantic import BaseModel, ConfigDict
from datetime import datetime
from ..models.membership import MembershipStatus
from .plan import PlanResponse


class MembershipCreate(BaseModel):
    member_id: int
    plan_id: int
    start_date: datetime | None = None
    end_date: datetime | None = None


class MembershipResponse(BaseModel):
    id: int
    member_id: int
    plan_id: int
    start_date: datetime
    end_date: datetime
    status: MembershipStatus
    plan: PlanResponse | None = None
    model_config = ConfigDict(from_attributes=True)


class MembershipListResponse(BaseModel):
    items: list[MembershipResponse]
    total: int
    page: int
    limit: int