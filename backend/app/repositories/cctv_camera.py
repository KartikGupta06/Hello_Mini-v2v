from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.cctv_camera import CCTVCamera

class CCTVCameraRepository:
    def get(self, db: Session, cctv_id: str) -> Optional[CCTVCamera]:
        return db.query(CCTVCamera).filter(CCTVCamera.cctv_id == cctv_id).first()

    def count(self, db: Session, *, district: Optional[str] = None, area_name: Optional[str] = None) -> int:
        query = db.query(CCTVCamera)
        if district:
            query = query.filter(CCTVCamera.district == district)
        if area_name:
            query = query.filter(CCTVCamera.area_name == area_name)
        return query.count()

    def get_multi(
        self, db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None, area_name: Optional[str] = None
    ) -> List[CCTVCamera]:
        query = db.query(CCTVCamera)
        if district:
            query = query.filter(CCTVCamera.district == district)
        if area_name:
            query = query.filter(CCTVCamera.area_name == area_name)
        return query.offset(offset).limit(limit).all()

cctv_camera_repository = CCTVCameraRepository()
