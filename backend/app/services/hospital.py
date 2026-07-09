from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.hospital import hospital_repository
from app.models.hospital import Hospital

class HospitalService:
    @staticmethod
    def get_hospital_by_id(db: Session, hospital_id: str) -> Hospital:
        hospital = hospital_repository.get(db, hospital_id=hospital_id)
        if not hospital:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hospital with id '{hospital_id}' not found"
            )
        return hospital

    @staticmethod
    def get_hospitals(
        db: Session, *, offset: int = 0, limit: int = 100, district: Optional[str] = None
    ) -> tuple[List[Hospital], int]:
        items = hospital_repository.get_multi(db, offset=offset, limit=limit, district=district)
        total = hospital_repository.count(db, district=district)
        return items, total
