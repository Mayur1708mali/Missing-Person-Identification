from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.missing_person import (
    MissingPersonCreate,
    MissingPersonUpdate,
    MissingPersonStatusUpdate,
    MissingPersonResponse,
    MissingPersonListResponse,
)
from app.services import missing_person_service

router = APIRouter(prefix="/api/missing-persons", tags=["Missing Persons"])


@router.get("", response_model=MissingPersonListResponse)
async def list_missing_persons(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    search: str | None = None,
    location: str | None = None,
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of missing persons. Public endpoint."""
    result = await missing_person_service.get_missing_persons(
        db, page=page, page_size=page_size, search=search, location=location, status=status
    )
    return result


@router.get("/statistics")
async def get_statistics(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    """Get case statistics. Admin only."""
    return await missing_person_service.get_statistics(db)


@router.get("/{person_id}", response_model=MissingPersonResponse)
async def get_missing_person(
    person_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single missing person by ID. Public endpoint."""
    person = await missing_person_service.get_missing_person_by_id(db, person_id)
    if not person:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    return person


@router.post("", response_model=MissingPersonResponse, status_code=status.HTTP_201_CREATED)
async def create_missing_person(
    data: MissingPersonCreate,
    photo_url: str = Query(..., description="URL of the uploaded photo"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new missing person report. Requires authentication."""
    person = await missing_person_service.create_missing_person(
        db, data=data, photo_url=photo_url, reported_by=current_user.id
    )
    return person


@router.put("/{person_id}", response_model=MissingPersonResponse)
async def update_missing_person(
    person_id: int,
    data: MissingPersonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a missing person. Allowed for admin or original reporter."""
    person = await missing_person_service.get_missing_person_by_id(db, person_id)
    if not person:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")

    if current_user.role.value != "admin" and person.reported_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    updated = await missing_person_service.update_missing_person(db, person, data)
    return updated


@router.patch("/{person_id}/status", response_model=MissingPersonResponse)
async def update_case_status(
    person_id: int,
    data: MissingPersonStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    """Update case status. Admin only."""
    person = await missing_person_service.get_missing_person_by_id(db, person_id)
    if not person:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")

    updated = await missing_person_service.update_case_status(db, person, data.case_status)
    return updated


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_missing_person(
    person_id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    """Delete a missing person record. Admin only."""
    person = await missing_person_service.get_missing_person_by_id(db, person_id)
    if not person:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")

    await missing_person_service.delete_missing_person(db, person)
