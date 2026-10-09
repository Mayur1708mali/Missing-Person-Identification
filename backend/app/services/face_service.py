import numpy as np
from pathlib import Path

from deepface import DeepFace
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pgvector.sqlalchemy import Vector

from app.models.face_embedding import FaceEmbedding
from app.models.missing_person import MissingPerson
from app.services.file_service import get_media_path

# DeepFace model configuration
MODEL_NAME = "Facenet"
DETECTOR_BACKEND = "opencv"
EMBEDDING_DIMENSION = 128
SIMILARITY_THRESHOLD = 0.6  # Cosine distance threshold (lower = more similar)


def generate_embedding(image_path: str) -> list[float] | None:
    """Generate a face embedding from an image file using DeepFace.

    Returns the embedding vector or None if no face is detected.
    """
    try:
        representations = DeepFace.represent(
            img_path=image_path,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=True,
        )
        if representations and len(representations) > 0:
            return representations[0]["embedding"]
    except Exception:
        return None
    return None


async def store_embedding(
    db: AsyncSession, missing_person_id: int, embedding: list[float]
) -> FaceEmbedding:
    """Store a face embedding in the database."""
    face_embedding = FaceEmbedding(
        missing_person_id=missing_person_id,
        embedding=embedding,
    )
    db.add(face_embedding)
    await db.flush()
    await db.refresh(face_embedding)
    return face_embedding


async def process_and_store_face(
    db: AsyncSession, missing_person_id: int, photo_filename: str
) -> bool:
    """Generate embedding from photo and store it. Returns True if successful."""
    media_path = get_media_path()
    image_path = str(media_path / photo_filename)

    if not Path(image_path).exists():
        return False

    embedding = generate_embedding(image_path)
    if embedding is None:
        return False

    await store_embedding(db, missing_person_id, embedding)
    return True


async def search_by_face(
    db: AsyncSession, image_path: str, threshold: float = SIMILARITY_THRESHOLD, limit: int = 10
) -> list[dict]:
    """Search for matching faces using cosine distance via pgvector.

    Returns a list of matches with person details and similarity scores.
    """
    # Generate embedding for the search image
    embedding = generate_embedding(image_path)
    if embedding is None:
        return []

    # Query pgvector for similar embeddings using cosine distance (<=>)
    embedding_vector = np.array(embedding).tolist()

    query = (
        select(
            FaceEmbedding,
            MissingPerson,
            FaceEmbedding.embedding.cosine_distance(embedding_vector).label("distance"),
        )
        .join(MissingPerson, FaceEmbedding.missing_person_id == MissingPerson.id)
        .where(FaceEmbedding.embedding.cosine_distance(embedding_vector) < threshold)
        .order_by("distance")
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.all()

    matches = []
    for row in rows:
        face_emb, person, distance = row
        similarity = round((1 - distance) * 100, 2)  # Convert distance to similarity percentage
        matches.append({
            "person": {
                "id": person.id,
                "full_name": person.full_name,
                "age": person.age,
                "gender": person.gender.value,
                "photo_url": person.photo_url,
                "last_seen_location": person.last_seen_location,
                "last_seen_date": str(person.last_seen_date),
                "case_status": person.case_status.value,
            },
            "similarity": similarity,
            "distance": round(distance, 4),
        })

    return matches
