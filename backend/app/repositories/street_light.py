from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.street_light import StreetLight

class StreetLightRepository:
    def get(self, db: Session, light_id: str) -> Optional[StreetLight]:
        return db.query(StreetLight).filter(StreetLight.light_id == light_id).first()

    def count(self, db: Session, *, district: Optional[str] = None, area_name: Optional[str] = None) -> int:
        query = db.query(StreetLight)
        if district:
            query = query.filter(StreetLight.district == district)
        if area_name:
            query = query.filter(StreetLight.area_name == area_name)
        return query.count()

    def get_multi(
        self, db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None, area_name: Optional[str] = None
    ) -> List[StreetLight]:
        query = db.query(StreetLight)
        if district:
            query = query.filter(StreetLight.district == district)
        if area_name:
            query = query.filter(StreetLight.area_name == area_name)
        return query.offset(offset).limit(limit).all()

street_light_repository = StreetLightRepository()
