import re
from pydantic import BaseModel, EmailStr, Field, model_validator, ConfigDict
from datetime import datetime
from ..core.roles import UserRole

PASSWORD_REGEX = re.compile(r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=50)

    @model_validator(mode="after")
    def validate_password(self):
        if not PASSWORD_REGEX.match(self.password):
            raise ValueError("La contraseña debe tener 8+ caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo especial.")
        return self

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)