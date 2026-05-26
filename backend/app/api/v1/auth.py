from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_db, limiter
from ...schemas.user import UserCreate, UserResponse
from ...schemas.token import Token
from ...services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        409: {"description": "Email duplicado"},
        422: {"description": "Error de validación (password policy, email)"}
    }
)
@limiter.limit("5/minute")
async def register(
    request: Request,
    data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Registra un nuevo usuario. Valida email único + política de contraseñas."""
    return await auth_service.register_user(db, data)

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(
    request: Request,
    data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Autentica usuario y devuelve JWT Bearer."""
    result = await auth_service.authenticate_user(db, data.email, data.password)
    # 🔒 En producción: mover token a httpOnly cookie con response.set_cookie()
    return {"access_token": result["access_token"], "token_type": "bearer"}