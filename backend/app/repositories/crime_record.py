from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.crime_record import CrimeRecord

class CrimeRecordRepository:
    def get(self, db: Session, crime_id: str) -> Optional[CrimeRecord]:
        return db.query(CrimeRecord).filter(CrimeRecord.crime_id == crime_id).first()

    def count(self, db: Session, *, district: Optional[str] = None, area_name: Optional[str] = None) -> int:
        query = db.query(CrimeRecord)
        if district:
            query = query.filter(CrimeRecord.district == district)
        if area_name:
            query = query.filter(CrimeRecord.area_name == area_name)
        return query.count()

    def get_multi(
        self, db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None, area_name: Optional[str] = None
    ) -> List[CrimeRecord]:
        query = db.query(CrimeRecord)
        if district:
            query = query.filter(CrimeRecord.district == district)
        if area_name:
            query = query.filter(CrimeRecord.area_name == area_name)
        return query.offset(offset).limit(limit).all()

crime_record_repository = CrimeRecordRepository()
