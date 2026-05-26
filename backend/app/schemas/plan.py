from pydantic import BaseModel, Field, ConfigDict
from ..models.plan import PlanStatus


class PlanCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str | None = Field(None, max_length=500)
    price: float = Field(..., gt=0)
    duration_days: int = Field(..., gt=0)
    features: str | None = Field(None, max_length=1000)
    status: PlanStatus = PlanStatus.ACTIVE


class PlanUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    description: str | None = Field(None, max_length=500)
    price: float | None = Field(None, gt=0)
    duration_days: int | None = Field(None, gt=0)
    features: str | None = None
    status: PlanStatus | None = None


class PlanResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: float
    duration_days: int
    features: str | None
    status: PlanStatus
    model_config = ConfigDict(from_attributes=True)