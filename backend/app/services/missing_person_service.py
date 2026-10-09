import math

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.missing_person import MissingPerson, CaseStatus, Gender
from app.schemas.missing_person import MissingPersonCreate, MissingPersonUpdate


async def create_missing_person(
    db: AsyncSession,
    data: MissingPersonCreate,
    photo_url: str,
    reported_by: int,
) -> MissingPerson:
    """Create a new missing person record."""
    person = MissingPerson(
        full_name=data.full_name,
        age=data.age,
        date_of_birth=data.date_of_birth,
        gender=Gender(data.gender),
        photo_url=photo_url,
        last_seen_location=data.last_seen_location,
        last_seen_date=data.last_seen_date,
        height=data.height,
        weight=data.weight,
        distinguishing_marks=data.distinguishing_marks,
        reporter_contact=data.reporter_contact,
        case_status=CaseStatus.missing,
        reported_by=reported_by,
    )
    db.add(person)
    await db.flush()
    await db.refresh(person)
    return person


async def get_missing_persons(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 12,
    search: str | None = None,
    location: str | None = None,
    status: str | None = None,
) -> dict:
    """Get paginated list of missing persons with optional filters."""
    query = select(MissingPerson)
    count_query = select(func.count(MissingPerson.id))

    # Apply filters
    if search:
        search_filter = or_(
            MissingPerson.full_name.ilike(f"%{search}%"),
            MissingPerson.distinguishing_marks.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if location:
        location_filter = MissingPerson.last_seen_location.ilike(f"%{location}%")
        query = query.where(location_filter)
        count_query = count_query.where(location_filter)

    if status:
        status_filter = MissingPerson.case_status == CaseStatus(status)
        query = query.where(status_filter)
        count_query = count_query.where(status_filter)

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(MissingPerson.created_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total > 0 else 0,
    }


async def get_missing_person_by_id(db: AsyncSession, person_id: int) -> MissingPerson | None:
    """Get a single missing person by ID."""
    result = await db.execute(select(MissingPerson).where(MissingPerson.id == person_id))
    return result.scalar_one_or_none()


async def update_missing_person(
    db: AsyncSession, person: MissingPerson, data: MissingPersonUpdate
) -> MissingPerson:
    """Update a missing person record."""
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            if field == "gender":
                setattr(person, field, Gender(value))
            else:
                setattr(person, field, value)
    await db.flush()
    await db.refresh(person)
    return person


async def update_case_status(
    db: AsyncSession, person: MissingPerson, status: str
) -> MissingPerson:
    """Update the case status of a missing person."""
    person.case_status = CaseStatus(status)
    await db.flush()
    await db.refresh(person)
    return person


async def delete_missing_person(db: AsyncSession, person: MissingPerson) -> None:
    """Delete a missing person record."""
    await db.delete(person)
    await db.flush()


async def get_statistics(db: AsyncSession) -> dict:
    """Get statistics for the admin dashboard."""
    total = await db.execute(select(func.count(MissingPerson.id)))
    missing = await db.execute(
        select(func.count(MissingPerson.id)).where(
            MissingPerson.case_status == CaseStatus.missing
        )
    )
    found = await db.execute(
        select(func.count(MissingPerson.id)).where(
            MissingPerson.case_status == CaseStatus.found
        )
    )
    investigating = await db.execute(
        select(func.count(MissingPerson.id)).where(
            MissingPerson.case_status == CaseStatus.under_investigation
        )
    )

    return {
        "total": total.scalar_one(),
        "missing": missing.scalar_one(),
        "found": found.scalar_one(),
        "under_investigation": investigating.scalar_one(),
    }
