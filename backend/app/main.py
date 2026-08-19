from fastapi import FastAPI

app = FastAPI(
    title="Missing Person Identification API",
    description="API for reporting and identifying missing persons using facial recognition",
    version="1.0.0",
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
