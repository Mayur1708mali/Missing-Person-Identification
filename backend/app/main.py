from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError

from app.config import settings
from app.routers import auth, missing_persons, upload, search, admin
from app.middleware.error_handler import global_exception_handler, integrity_error_handler
from app.services.file_service import get_media_path

app = FastAPI(
    title="Missing Person Identification API",
    description="API for reporting and identifying missing persons using facial recognition",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)

# Register routers
app.include_router(auth.router)
app.include_router(missing_persons.router)
app.include_router(upload.router)
app.include_router(search.router)
app.include_router(admin.router)

# Serve uploaded media files
media_path = get_media_path()
app.mount("/media", StaticFiles(directory=str(media_path)), name="media")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
