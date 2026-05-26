from fastapi import APIRouter, Depends, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timezone

from ...core.dependencies import get_db, require_role, limiter
from ...core.roles import UserRole
from ...models.member import MemberStatus
from ...schemas.member import MemberCreate, MemberUpdate, MemberResponse, MemberListResponse
from ...repositories import member as member_repo

router = APIRouter(prefix="/members", tags=["Miembros"])

@router.get("/", response_model=MemberListResponse)
@limiter.limit("50/minute")
async def get_members(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: MemberStatus | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER))
):
    items, total = await member_repo.list_members(db, page, limit, status)
    return {"items": items, "total": total, "page": page, "limit": limit}

@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_member(
    request: Request,
    data: MemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER))
):
    return await member_repo.create_member(db, data.model_dump())

@router.patch("/{member_id}/terminate", response_model=MemberResponse)
@limiter.limit("10/minute")
async def terminate_member(
    request: Request,
    member_id: int,
    data: MemberUpdate = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN))
):
    end_date = data.ended_at.replace(tzinfo=timezone.utc) if data and data.ended_at else None
    return await member_repo.terminate_member(db, member_id, end_date)