from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.police_station import PoliceStation

class PoliceStationRepository:
    def get(self, db: Session, station_id: str) -> Optional[PoliceStation]:
        return db.query(PoliceStation).filter(PoliceStation.station_id == station_id).first()

    def count(self, db: Session, *, district: Optional[str] = None) -> int:
        query = db.query(PoliceStation)
        if district:
            query = query.filter(PoliceStation.district == district)
        return query.count()

    def get_multi(
        self, db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None
    ) -> List[PoliceStation]:
        query = db.query(PoliceStation)
        if district:
            query = query.filter(PoliceStation.district == district)
        return query.offset(offset).limit(limit).all()

police_station_repository = PoliceStationRepository()
