from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.police_station import PoliceStation
from app.schemas.response import PaginatedResponse, SingleResponse
from app.services.police_station import PoliceStationService

router = APIRouter()

@router.get(
    "/", 
    response_model=PaginatedResponse[PoliceStation],
    summary="List police stations",
    description="Query police stations with pagination and optional district filtering."
)
def read_police_stations(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    items, total = PoliceStationService.get_stations(db, offset=offset, limit=limit, district=district)
    return {
        "success": True,
        "count": len(items),
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": items
    }

@router.get(
    "/{station_id}", 
    response_model=SingleResponse[PoliceStation],
    summary="Get police station by ID"
)
def read_police_station(
    station_id: str,
    db: Session = Depends(get_db)
):
    item = PoliceStationService.get_station_by_id(db, station_id=station_id)
    return {"success": True, "data": item}
