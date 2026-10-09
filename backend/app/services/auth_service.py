import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User, UserRole


GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


async def verify_google_token(token: str) -> dict | None:
    """Verify Google OAuth token and return user info."""
    async with httpx.AsyncClient() as client:
        # Try as access token first (get user info)
        response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token}"},
        )
        if response.status_code == 200:
            return response.json()

        # Try as ID token
        response = await client.get(
            GOOGLE_TOKEN_INFO_URL,
            params={"id_token": token},
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("aud") == settings.google_client_id:
                return data

    return None


async def get_or_create_user(db: AsyncSession, google_user_info: dict) -> User:
    """Find existing user by Google ID or create a new one."""
    google_id = google_user_info.get("sub")
    email = google_user_info.get("email")
    name = google_user_info.get("name", email)
    avatar_url = google_user_info.get("picture")

    # Look for existing user
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user:
        # Update name and avatar if changed
        user.name = name
        user.avatar_url = avatar_url
        await db.flush()
        return user

    # Determine role: first user becomes admin
    from sqlalchemy import func

    user_count_result = await db.execute(select(func.count(User.id)))
    user_count = user_count_result.scalar_one()
    role = UserRole.admin if user_count == 0 else UserRole.user

    # Create new user
    user = User(
        email=email,
        name=name,
        google_id=google_id,
        avatar_url=avatar_url,
        role=role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    """Fetch a user by their ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
