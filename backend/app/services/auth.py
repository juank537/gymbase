from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.security import hash_password, verify_password, create_access_token
from ..models.user import User
from ..repositories import user as user_repo
from ..schemas.user import UserCreate

async def register_user(db: AsyncSession, data: UserCreate) -> User:
    existing = await user_repo.get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado en el sistema"
        )
    hashed_pw = hash_password(data.password)
    new_user = User(email=data.email, hashed_password=hashed_pw, full_name=data.full_name)
    return await user_repo.create_user(db, new_user)

async def authenticate_user(db: AsyncSession, email: str, password: str) -> dict:
    user = await user_repo.get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada o pendiente de verificación"
        )
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

def create_access_for_user(user: User) -> str:
    return create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
