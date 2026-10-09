from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class RoleUpdateRequest(BaseModel):
    role: str


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    """List all registered users. Admin only."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "avatar_url": u.avatar_url,
            "role": u.role.value,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    data: RoleUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    """Update a user's role. Admin only."""
    if data.role not in ["admin", "user"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = UserRole(data.role)
    await db.flush()
    await db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar_url": user.avatar_url,
        "role": user.role.value,
        "created_at": user.created_at.isoformat(),
    }
