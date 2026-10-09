import enum
from datetime import date, datetime

from sqlalchemy import String, Text, Enum, Date, DateTime, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CaseStatus(str, enum.Enum):
    missing = "missing"
    found = "found"
    under_investigation = "under_investigation"


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class MissingPerson(Base):
    __tablename__ = "missing_persons"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[Gender] = mapped_column(Enum(Gender), nullable=False)
    photo_url: Mapped[str] = mapped_column(String(512), nullable=False)
    last_seen_location: Mapped[str] = mapped_column(String(500), nullable=False)
    last_seen_date: Mapped[date] = mapped_column(Date, nullable=False)
    height: Mapped[str | None] = mapped_column(String(50), nullable=True)
    weight: Mapped[str | None] = mapped_column(String(50), nullable=True)
    distinguishing_marks: Mapped[str | None] = mapped_column(Text, nullable=True)
    reporter_contact: Mapped[str] = mapped_column(String(255), nullable=False)
    case_status: Mapped[CaseStatus] = mapped_column(
        Enum(CaseStatus), default=CaseStatus.missing, nullable=False
    )
    reported_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    reporter = relationship("User", back_populates="reported_persons")
    face_embedding = relationship("FaceEmbedding", back_populates="missing_person", uselist=False)
