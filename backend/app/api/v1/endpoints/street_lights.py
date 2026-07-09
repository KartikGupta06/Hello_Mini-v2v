from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.street_light import StreetLight
from app.schemas.response import PaginatedResponse, SingleResponse
from app.services.street_light import StreetLightService

router = APIRouter()

@router.get(
    "/", 
    response_model=PaginatedResponse[StreetLight],
    summary="List street lights",
    description="Query street lights with pagination and optional district/area filtering."
)
def read_street_lights(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    district: Optional[str] = Query(None),
    area_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    items, total = StreetLightService.get_lights(db, offset=offset, limit=limit, district=district, area_name=area_name)
    return {
        "success": True,
        "count": len(items),
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": items
    }

@router.get(
    "/{light_id}", 
    response_model=SingleResponse[StreetLight],
    summary="Get street light by ID"
)
def read_street_light(
    light_id: str,
    db: Session = Depends(get_db)
):
    item = StreetLightService.get_light_by_id(db, light_id=light_id)
    return {"success": True, "data": item}
