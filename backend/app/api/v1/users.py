from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from ...core.dependencies import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...core.dependencies import get_db, require_role, limiter
from ...core.roles import UserRole
from ...models.user import User
from ...schemas.user import UserResponse
from typing import List

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.get("/me", response_model=UserResponse)
@limiter.limit("30/minute")
async def get_my_profile(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return current_user

@router.get("/", response_model=List[UserResponse])
@limiter.limit("20/minute")
async def list_users(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    offset = (page - 1) * limit
    result = await db.execute(select(User).offset(offset).limit(limit))
    return result.scalars().all()

@router.patch("/{user_id}/role", response_model=UserResponse)
@limiter.limit("10/minute")
async def update_user_role(
    request: Request,
    user_id: int,
    new_role: UserRole,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    user.role = new_role
    await db.commit()
    await db.refresh(user)
    return user