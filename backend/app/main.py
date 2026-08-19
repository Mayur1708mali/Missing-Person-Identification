from fastapi import FastAPI

from app.routers import auth

app = FastAPI(
    title="Missing Person Identification API",
    description="API for reporting and identifying missing persons using facial recognition",
    version="1.0.0",
)

# Register routers
app.include_router(auth.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
