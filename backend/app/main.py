from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import auth, missing_persons, upload, search
from app.services.file_service import get_media_path

app = FastAPI(
    title="Missing Person Identification API",
    description="API for reporting and identifying missing persons using facial recognition",
    version="1.0.0",
)

# Register routers
app.include_router(auth.router)
app.include_router(missing_persons.router)
app.include_router(upload.router)
app.include_router(search.router)

# Serve uploaded media files
media_path = get_media_path()
app.mount("/media", StaticFiles(directory=str(media_path)), name="media")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
