from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.street_light import street_light_repository
from app.models.street_light import StreetLight

class StreetLightService:
    @staticmethod
    def get_light_by_id(db: Session, light_id: str) -> StreetLight:
        light = street_light_repository.get(db, light_id=light_id)
        if not light:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Street light with id '{light_id}' not found"
            )
        return light

    @staticmethod
    def get_lights(
        db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None, area_name: Optional[str] = None
    ) -> tuple[List[StreetLight], int]:
        items = street_light_repository.get_multi(db, offset=offset, limit=limit, district=district, area_name=area_name)
        total = street_light_repository.count(db, district=district, area_name=area_name)
        return items, total
