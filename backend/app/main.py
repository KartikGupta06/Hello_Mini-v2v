from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from contextlib import asynccontextmanager
from sqlalchemy import text
from app.database.session import engine

from app.core.config import settings
from app.middleware.logging import LoggingMiddleware
from app.middleware.errors import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from app.api.v1.endpoints import health, auth, users, contacts, journeys, reports, police, hospitals, street_lights, cctv, crimes, sos

import time

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify database connectivity on startup
    try:
        if "sqlite" in settings.SQLALCHEMY_DATABASE_URI:
            from app.database.base import Base
            Base.metadata.create_all(bind=engine)
            print("SQLite database tables created/verified successfully on startup.")
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("Database connectivity verified successfully on startup.")
    except Exception as e:
        print(f"CRITICAL: Database connectivity failed on startup: {e}")
    
    yield
    
    # Gracefully close resources during shutdown
    engine.dispose()
    print("Database engine disposed successfully during shutdown.")

# Initialize application instance with custom OpenAPI configurations and lifespan lifecycle
app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"/api/{settings.API_VERSION}/openapi.json",
    docs_url=f"/api/{settings.API_VERSION}/docs",
    redoc_url=f"/api/{settings.API_VERSION}/redoc",
    lifespan=lifespan,
)

app.state.start_time = time.time()

# Set CORS parameters
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
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
app.include_router(
    police.router,
    prefix=f"/api/{settings.API_VERSION}/police-stations",
    tags=["Police Stations Infrastructure"]
)
app.include_router(
    hospitals.router,
    prefix=f"/api/{settings.API_VERSION}/hospitals",
    tags=["Hospitals Infrastructure"]
)
app.include_router(
    street_lights.router,
    prefix=f"/api/{settings.API_VERSION}/street-lights",
    tags=["Street Lights Infrastructure"]
)
app.include_router(
    cctv.router,
    prefix=f"/api/{settings.API_VERSION}/cctv-cameras",
    tags=["CCTV Cameras Infrastructure"]
)
app.include_router(
    crimes.router,
    prefix=f"/api/{settings.API_VERSION}/crime-records",
    tags=["Crime Records Incidents"]
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
from app.routing.api.router import router as routing_router
app.include_router(
    routing_router, 
    prefix=f"/api/{settings.API_VERSION}/routes", 
    tags=["Intelligent Route Analysis Engine"]
)
app.include_router(
    sos.router, 
    prefix=f"/api/{settings.API_VERSION}/sos", 
    tags=["SOS Emergency Backend"]
)
