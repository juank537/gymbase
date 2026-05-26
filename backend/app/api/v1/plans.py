from fastapi import APIRouter, Depends, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_db, require_role, limiter
from ...core.roles import UserRole
from ...schemas.plan import PlanCreate, PlanUpdate, PlanResponse
from ...repositories import plan as plan_repo

router = APIRouter(prefix="/plans", tags=["Planes"])


@router.get("/", response_model=list[PlanResponse])
@limiter.limit("30/minute")
async def get_plans(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    items, _ = await plan_repo.list_plans(db, page, limit, active_only)
    return items


@router.get("/{plan_id}", response_model=PlanResponse)
@limiter.limit("30/minute")
async def get_plan(
    request: Request,
    plan_id: int,
    db: AsyncSession = Depends(get_db),
):
    plan = await plan_repo.get_plan(db, plan_id)
    if not plan:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return plan


@router.post("/", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_plan(
    request: Request,
    data: PlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN)),
):
    return await plan_repo.create_plan(db, data.model_dump())


@router.patch("/{plan_id}", response_model=PlanResponse)
@limiter.limit("10/minute")
async def update_plan(
    request: Request,
    plan_id: int,
    data: PlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN)),
):
    plan = await plan_repo.update_plan(db, plan_id, data.model_dump(exclude_none=True))
    if not plan:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return plan