import time
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.core.config import settings

router = APIRouter()

@router.get("/health", summary="Health Check API")
def get_health(request: Request, db: Session = Depends(get_db)):
    """Detailed health check validating connection status of database."""
    try:
        db.execute(text("SELECT 1"))
        try:
            db_version = db.execute(text("SELECT version()")).scalar()
        except Exception:
            try:
                db_version = db.execute(text("SELECT sqlite_version()")).scalar()
            except Exception:
                db_version = "Generic Database"
        db_status = "connected"
    except Exception as e:
        db_version = "Unknown"
        db_status = f"unreachable ({type(e).__name__})"
    
    # Calculate uptime
    uptime_seconds = time.time() - request.app.state.start_time
    uptime_str = str(timedelta(seconds=int(uptime_seconds)))
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app_name": settings.APP_NAME,
        "database": db_status,
        "database_version": db_version,
        "api_version": settings.API_VERSION,
        "application_version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "uptime": uptime_str,
        "environment": settings.ENVIRONMENT
    }

@router.get("/status", summary="Server Status API")
def get_status():
    """Quick status check for monitoring services."""
    return {"status": "OK"}

@router.get("/version", summary="API Version API")
def get_version():
    """Returns the current semantic version information."""
    return {
        "version": settings.APP_VERSION,
        "api_version": settings.API_VERSION
    }
