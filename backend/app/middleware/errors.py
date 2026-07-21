import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("app_error_handler")

def get_cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin")
    if origin:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return {}

async def http_exception_handler(
    request: Request, 
    exc: StarletteHTTPException
) -> JSONResponse:
    """Handle standard HTTPException instances and serialize details."""
    logger.warning(f"HTTP error intercepted: {exc.detail} | Status: {exc.status_code}")
    return JSONResponse(
        status_code=exc.status_code,
        headers=get_cors_headers(request),
        content={
            "success": False, 
            "error": exc.detail, 
            "code": exc.status_code
        }
    )

async def validation_exception_handler(
    request: Request, 
    exc: RequestValidationError
) -> JSONResponse:
    """Format validation errors from FastAPI body parsing constraints."""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        errors.append({
            "field": field, 
            "message": error["msg"], 
            "type": error["type"]
        })
    
    logger.warning(f"Request validation mismatch: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        headers=get_cors_headers(request),
        content={
            "success": False,
            "error": "Request validation failed",
            "details": errors,
            "code": 422
        }
    )

async def generic_exception_handler(
    request: Request, 
    exc: Exception
) -> JSONResponse:
    """Catch-all unhandled server failures wrapper."""
    logger.error(f"Unhandled system crash: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        headers=get_cors_headers(request),
        content={
            "success": False,
            "error": "Internal server configuration error",
            "code": 500
        }
    )
