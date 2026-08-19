from datetime import date, datetime

from pydantic import BaseModel, Field


class MissingPersonCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    age: int | None = Field(None, ge=0, le=120)
    date_of_birth: date | None = None
    gender: str = Field(..., pattern="^(male|female|other)$")
    last_seen_location: str = Field(..., min_length=3, max_length=500)
    last_seen_date: date
    height: str | None = Field(None, max_length=50)
    weight: str | None = Field(None, max_length=50)
    distinguishing_marks: str | None = None
    reporter_contact: str = Field(..., max_length=255)


class MissingPersonUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=255)
    age: int | None = Field(None, ge=0, le=120)
    date_of_birth: date | None = None
    gender: str | None = Field(None, pattern="^(male|female|other)$")
    last_seen_location: str | None = Field(None, min_length=3, max_length=500)
    last_seen_date: date | None = None
    height: str | None = Field(None, max_length=50)
    weight: str | None = Field(None, max_length=50)
    distinguishing_marks: str | None = None
    reporter_contact: str | None = Field(None, max_length=255)


class MissingPersonStatusUpdate(BaseModel):
    case_status: str = Field(..., pattern="^(missing|found|under_investigation)$")


class MissingPersonResponse(BaseModel):
    id: int
    full_name: str
    age: int | None = None
    date_of_birth: date | None = None
    gender: str
    photo_url: str
    last_seen_location: str
    last_seen_date: date
    height: str | None = None
    weight: str | None = None
    distinguishing_marks: str | None = None
    reporter_contact: str
    case_status: str
    reported_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MissingPersonListResponse(BaseModel):
    items: list[MissingPersonResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
