from fastapi import APIRouter, Depends, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_db, require_role, limiter
from ...core.roles import UserRole
from ...schemas.membership import MembershipCreate, MembershipResponse, MembershipListResponse
from ...repositories import membership as membership_repo

router = APIRouter(prefix="/memberships", tags=["Membresías"])


@router.get("/", response_model=MembershipListResponse)
@limiter.limit("30/minute")
async def get_memberships(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    member_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER)),
):
    items, total = await membership_repo.list_memberships(db, page, limit, member_id)
    return {"items": items, "total": total, "page": page, "limit": limit}


@router.post("/", response_model=MembershipResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_membership(
    request: Request,
    data: MembershipCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER)),
):
    return await membership_repo.create_membership(db, data.model_dump())


@router.patch("/{membership_id}/cancel", response_model=MembershipResponse)
@limiter.limit("10/minute")
async def cancel_membership(
    request: Request,
    membership_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN)),
):
    membership = await membership_repo.cancel_membership(db, membership_id)
    if not membership:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Membresía no encontrada")
    return membership