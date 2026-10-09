from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.services.auth_service import verify_google_token, get_or_create_user
from app.utils.jwt import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class GoogleLoginRequest(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: str | None
    role: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/google", response_model=AuthResponse)
async def google_login(request: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user with Google OAuth token."""
    google_user_info = await verify_google_token(request.token)

    if not google_user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    user = await get_or_create_user(db, google_user_info)

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})

    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            role=user.role.value,
        ),
    )
