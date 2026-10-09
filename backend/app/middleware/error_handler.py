import traceback

from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle uncaught exceptions with a structured JSON response."""
    # Log the full traceback for debugging
    traceback.print_exc()

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred. Please try again later.",
            "type": "internal_error",
        },
    )


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    """Handle database integrity errors (duplicate keys, constraint violations)."""
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "detail": "A database conflict occurred. The record may already exist.",
            "type": "integrity_error",
        },
    )
