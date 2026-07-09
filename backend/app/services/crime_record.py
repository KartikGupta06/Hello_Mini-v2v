from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.crime_record import crime_record_repository
from app.models.crime_record import CrimeRecord

class CrimeRecordService:
    @staticmethod
    def get_crime_by_id(db: Session, crime_id: str) -> CrimeRecord:
        crime = crime_record_repository.get(db, crime_id=crime_id)
        if not crime:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crime record with id '{crime_id}' not found"
            )
        return crime

    @staticmethod
    def get_crimes(
        db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None, area_name: Optional[str] = None
    ) -> tuple[List[CrimeRecord], int]:
        items = crime_record_repository.get_multi(db, offset=offset, limit=limit, district=district, area_name=area_name)
        total = crime_record_repository.count(db, district=district, area_name=area_name)
        return items, total
