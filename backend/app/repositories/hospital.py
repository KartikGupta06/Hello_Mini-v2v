from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.hospital import Hospital

class HospitalRepository:
    def get(self, db: Session, hospital_id: str) -> Optional[Hospital]:
        return db.query(Hospital).filter(Hospital.hospital_id == hospital_id).first()

    def count(self, db: Session, *, district: Optional[str] = None) -> int:
        query = db.query(Hospital)
        if district:
            query = query.filter(Hospital.district == district)
        return query.count()

    def get_multi(
        self, db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None
    ) -> List[Hospital]:
        query = db.query(Hospital)
        if district:
            query = query.filter(Hospital.district == district)
        return query.offset(offset).limit(limit).all()

hospital_repository = HospitalRepository()
