from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.crime_record import CrimeRecord
from app.schemas.response import PaginatedResponse, SingleResponse
from app.services.crime_record import CrimeRecordService

router = APIRouter()

@router.get(
    "/", 
    response_model=PaginatedResponse[CrimeRecord],
    summary="List crime records",
    description="Query crime records with pagination and optional district/area filtering."
)
def read_crime_records(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    district: Optional[str] = Query(None),
    area_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    items, total = CrimeRecordService.get_crimes(db, offset=offset, limit=limit, district=district, area_name=area_name)
    return {
        "success": True,
        "count": len(items),
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": items
    }

@router.get(
    "/{crime_id}", 
    response_model=SingleResponse[CrimeRecord],
    summary="Get crime record by ID"
)
def read_crime_record(
    crime_id: str,
    db: Session = Depends(get_db)
):
    item = CrimeRecordService.get_crime_by_id(db, crime_id=crime_id)
    return {"success": True, "data": item}
