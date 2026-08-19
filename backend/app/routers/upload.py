from fastapi import APIRouter, Depends, UploadFile, File

from app.dependencies import get_current_user
from app.models.user import User
from app.services.file_service import save_upload

router = APIRouter(prefix="/api/upload", tags=["Upload"])


@router.post("")
async def upload_photo(
    file: UploadFile = File(...),
    _current_user: User = Depends(get_current_user),
):
    """Upload a photo. Returns the filename for use in other endpoints."""
    filename = await save_upload(file)
    return {"filename": filename, "url": f"/media/{filename}"}
