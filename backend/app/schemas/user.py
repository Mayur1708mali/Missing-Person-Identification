from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: str | None = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRole(BaseModel):
    role: str
