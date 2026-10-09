import os
import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException, status

from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def get_media_path() -> Path:
    """Get the media directory path, creating it if it doesn't exist."""
    media_path = Path(settings.media_dir)
    media_path.mkdir(parents=True, exist_ok=True)
    return media_path


def validate_image(file: UploadFile) -> None:
    """Validate that the uploaded file is a valid image."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided",
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )


async def save_upload(file: UploadFile) -> str:
    """Save an uploaded file and return its relative path."""
    validate_image(file)

    # Read file content to check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )

    # Generate unique filename
    ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"

    # Save file
    media_path = get_media_path()
    file_path = media_path / unique_filename

    with open(file_path, "wb") as f:
        f.write(content)

    return unique_filename


def get_file_path(filename: str) -> Path:
    """Get the full path of a stored file."""
    media_path = get_media_path()
    file_path = media_path / filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    return file_path


def delete_file(filename: str) -> None:
    """Delete a file from storage."""
    media_path = get_media_path()
    file_path = media_path / filename
    if file_path.exists():
        file_path.unlink()
