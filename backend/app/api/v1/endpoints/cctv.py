from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.cctv_camera import CCTVCamera
from app.schemas.response import PaginatedResponse, SingleResponse
from app.services.cctv_camera import CCTVCameraService

router = APIRouter()

@router.get(
    "/", 
    response_model=PaginatedResponse[CCTVCamera],
    summary="List CCTV cameras",
    description="Query CCTV cameras with pagination and optional district/area filtering."
)
def read_cctv_cameras(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    district: Optional[str] = Query(None),
    area_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    items, total = CCTVCameraService.get_cctvs(db, offset=offset, limit=limit, district=district, area_name=area_name)
    return {
        "success": True,
        "count": len(items),
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": items
    }

@router.get(
    "/{cctv_id}", 
    response_model=SingleResponse[CCTVCamera],
    summary="Get CCTV camera by ID"
)
def read_cctv_camera(
    cctv_id: str,
    db: Session = Depends(get_db)
):
    item = CCTVCameraService.get_cctv_by_id(db, cctv_id=cctv_id)
    return {"success": True, "data": item}
