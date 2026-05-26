from fastapi import APIRouter, Depends, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from ...core.dependencies import get_db, limiter
from ...core.config import get_settings
from ...core.security import create_refresh_token, decode_token
from ...schemas.user import UserCreate, UserLogin, UserResponse
from ...schemas.token import Token, RefreshResponse
from ...services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])
settings = get_settings()


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token", value=access_token,
        httponly=True, samesite="lax", secure=False,
        max_age=settings.access_token_expire_minutes * 60, path="/",
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, samesite="lax", secure=False,
        max_age=settings.refresh_token_expire_days * 86400, path="/api/v1/auth",
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, data: UserCreate, db: AsyncSession = Depends(get_db)):
    return await auth_service.register_user(db, data)


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, data: UserLogin, db: AsyncSession = Depends(get_db), response: Response = None):
    result = await auth_service.authenticate_user(db, data.email, data.password)
    refresh_token = create_refresh_token({"sub": str(result["user"].id), "type": "refresh"})
    _set_auth_cookies(response, result["access_token"], refresh_token)
    return {"access_token": result["access_token"], "token_type": "bearer"}


@router.post("/refresh", response_model=RefreshResponse)
@limiter.limit("20/minute")
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED, content='{"detail":"No hay sesión activa"}', media_type="application/json")
    try:
        payload = decode_token(token)
        if payload.get("type") not in ("refresh", "access"):
            return Response(status_code=status.HTTP_401_UNAUTHORIZED, content='{"detail":"Token inválido"}', media_type="application/json")
    except JWTError:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED, content='{"detail":"Token expirado o corrupto"}', media_type="application/json")
    user_id = payload.get("sub")
    user = await auth_service.get_user_by_id(db, int(user_id))
    if not user or not user.is_active:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED, content='{"detail":"Usuario no encontrado o inactivo"}', media_type="application/json")
    new_access = auth_service.create_access_for_user(user)
    new_refresh = create_refresh_token({"sub": str(user.id)})
    _set_auth_cookies(response, new_access, new_refresh)
    return {"access_token": new_access, "token_type": "bearer", "user": UserResponse.model_validate(user)}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/v1/auth")
    return {"detail": "Sesión cerrada"}

