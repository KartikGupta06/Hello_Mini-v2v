from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.core.config import settings

router = APIRouter()

@router.get("/health", summary="Health Check API")
def get_health(db: Session = Depends(get_db)):
    """Detailed health check validating connection status of database."""
    try:
        # Check database connectivity
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unreachable ({type(e).__name__})"
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app_name": settings.APP_NAME,
        "api_version": settings.API_VERSION,
        "database": db_status
    }

@router.get("/status", summary="Server Status API")
def get_status():
    """Quick status check for monitoring services."""
    return {"status": "OK"}

@router.get("/version", summary="API Version API")
def get_version():
    """Returns the current semantic version information."""
    return {
        "version": "1.0.0",
        "api_version": settings.API_VERSION
    }
