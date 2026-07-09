from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.cctv_camera import cctv_camera_repository
from app.models.cctv_camera import CCTVCamera

class CCTVCameraService:
    @staticmethod
    def get_cctv_by_id(db: Session, cctv_id: str) -> CCTVCamera:
        cctv = cctv_camera_repository.get(db, cctv_id=cctv_id)
        if not cctv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"CCTV camera with id '{cctv_id}' not found"
            )
        return cctv

    @staticmethod
    def get_cctvs(
        db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None, area_name: Optional[str] = None
    ) -> tuple[List[CCTVCamera], int]:
        items = cctv_camera_repository.get_multi(db, offset=offset, limit=limit, district=district, area_name=area_name)
        total = cctv_camera_repository.count(db, district=district, area_name=area_name)
        return items, total
