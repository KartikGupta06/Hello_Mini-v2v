from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.police_station import police_station_repository
from app.models.police_station import PoliceStation

class PoliceStationService:
    @staticmethod
    def get_station_by_id(db: Session, station_id: str) -> PoliceStation:
        station = police_station_repository.get(db, station_id=station_id)
        if not station:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Police station with id '{station_id}' not found"
            )
        return station

    @staticmethod
    def get_stations(
        db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None
    ) -> tuple[List[PoliceStation], int]:
        items = police_station_repository.get_multi(db, offset=offset, limit=limit, district=district)
        total = police_station_repository.count(db, district=district)
        return items, total
