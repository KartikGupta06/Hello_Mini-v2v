from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.hospital import Hospital
from app.schemas.response import PaginatedResponse, SingleResponse
from app.services.hospital import HospitalService

router = APIRouter()

@router.get(
    "/", 
    response_model=PaginatedResponse[Hospital],
    summary="List hospitals",
    description="Query hospitals with pagination and optional district filtering."
)
def read_hospitals(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    items, total = HospitalService.get_hospitals(db, offset=offset, limit=limit, district=district)
    return {
        "success": True,
        "count": len(items),
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": items
    }

@router.get(
    "/{hospital_id}", 
    response_model=SingleResponse[Hospital],
    summary="Get hospital by ID"
)
def read_hospital(
    hospital_id: str,
    db: Session = Depends(get_db)
):
    item = HospitalService.get_hospital_by_id(db, hospital_id=hospital_id)
    return {"success": True, "data": item}
