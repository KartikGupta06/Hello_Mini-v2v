from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.middleware.logging import LoggingMiddleware
from app.middleware.errors import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from app.api.v1.endpoints import health, auth, users, contacts, journeys, reports

# Initialize application instance with custom OpenAPI configurations
app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"/api/{settings.API_VERSION}/openapi.json",
    docs_url=f"/api/{settings.API_VERSION}/docs",
    redoc_url=f"/api/{settings.API_VERSION}/redoc",
)

# Set CORS parameters
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict origins in production as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register request logging middleware
app.add_middleware(LoggingMiddleware)

# Bind exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include API Routers
app.include_router(
    health.router, 
    prefix=f"/api/{settings.API_VERSION}", 
    tags=["Utility & Monitoring"]
)
app.include_router(
    auth.router, 
    prefix=f"/api/{settings.API_VERSION}/auth", 
    tags=["Authentication & Credentials"]
)
app.include_router(
    users.router, 
    prefix=f"/api/{settings.API_VERSION}/users", 
    tags=["User Account Profile"]
)
app.include_router(
    contacts.router, 
    prefix=f"/api/{settings.API_VERSION}/contacts", 
    tags=["Emergency Trust Contacts"]
)
app.include_router(
    journeys.router, 
    prefix=f"/api/{settings.API_VERSION}/journeys", 
    tags=["Journey History logs"]
)
app.include_router(
    reports.router, 
    prefix=f"/api/{settings.API_VERSION}/reports", 
    tags=["Community Safety Reports"]
)
from app.safety.api.router import router as safety_router
app.include_router(
    safety_router, 
    prefix=f"/api/{settings.API_VERSION}/safety", 
    tags=["Safety Intelligence Data"]
)
from app.ai.api.router import router as ai_router
app.include_router(
    ai_router, 
    prefix=f"/api/{settings.API_VERSION}/ai", 
    tags=["Explainable Safety Scoring Engine"]
)
