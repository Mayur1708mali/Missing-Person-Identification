import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.face_service import search_by_face
from app.services.file_service import get_media_path, validate_image, MAX_FILE_SIZE

router = APIRouter(prefix="/api/search", tags=["Face Search"])


@router.post("/face")
async def search_face(
    file: UploadFile = File(...),
    threshold: float = Query(0.6, ge=0.1, le=1.0),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Search for matching faces in the database.

    Upload a photo and find potential matches among registered missing persons.
    Requires authentication.
    """
    validate_image(file)

    # Read and save temporary file for processing
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size: 5MB",
        )

    # Save temp file for DeepFace processing
    ext = os.path.splitext(file.filename)[1].lower()
    temp_filename = f"temp_{uuid.uuid4().hex}{ext}"
    media_path = get_media_path()
    temp_path = media_path / temp_filename

    try:
        with open(temp_path, "wb") as f:
            f.write(content)

        # Perform face search
        matches = await search_by_face(db, str(temp_path), threshold=threshold, limit=limit)

        if not matches:
            return {
                "matches": [],
                "message": "No matching faces found in the database.",
                "total": 0,
            }

        return {
            "matches": matches,
            "message": f"Found {len(matches)} potential match(es).",
            "total": len(matches),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Face search failed: {str(e)}",
        )
    finally:
        # Clean up temp file
        if temp_path.exists():
            temp_path.unlink()
