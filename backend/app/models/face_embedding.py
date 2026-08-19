from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.database import Base


class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    missing_person_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("missing_persons.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    # FaceNet model produces 128-dimensional embeddings
    embedding: Mapped[list] = mapped_column(Vector(128), nullable=False)

    missing_person = relationship("MissingPerson", back_populates="face_embedding")
