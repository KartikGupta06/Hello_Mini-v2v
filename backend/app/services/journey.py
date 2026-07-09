from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.journey import journey_repository
from app.models.journey import JourneyHistory
from app.schemas.journey import JourneyHistoryCreate, JourneyHistoryUpdate
from app.utils.query import apply_pagination, apply_sorting

class JourneyHistoryService:
    @staticmethod
    def get_journey_by_id(db: Session, journey_id: int, user_id: int) -> JourneyHistory:
        """Fetch journey log checking user ownership, raises 404 if missing or unauthorized."""
        journey = journey_repository.get(db, id=journey_id)
        if not journey or journey.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journey history log not found or unauthorized access"
            )
        return journey

    @staticmethod
    def get_user_journeys(
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        sort_by: str = "created_at",
        order: str = "desc"
    ) -> List[JourneyHistory]:
        """Fetch pagination logs of journeys registered under user, applying sorting metrics."""
        query = db.query(JourneyHistory).filter(JourneyHistory.user_id == user_id)
        query = apply_sorting(query, JourneyHistory, sort_by=sort_by, order=order)
        query = apply_pagination(query, skip=skip, limit=limit)
        return query.all()

    @staticmethod
    def create_journey(db: Session, obj_in: JourneyHistoryCreate, user_id: int) -> JourneyHistory:
        """Initialize and persist new journey records."""
        if obj_in.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mismatch user validation context"
            )
        return journey_repository.create(db, obj_in=obj_in)

    @staticmethod
    def update_journey(
        db: Session, 
        journey_id: int, 
        obj_in: JourneyHistoryUpdate, 
        user_id: int
    ) -> JourneyHistory:
        """Update existing journey properties (status changes, completion times)."""
        journey = JourneyHistoryService.get_journey_by_id(db, journey_id=journey_id, user_id=user_id)
        return journey_repository.update(db, db_obj=journey, obj_in=obj_in)

    @staticmethod
    def delete_journey(db: Session, journey_id: int, user_id: int) -> JourneyHistory:
        """Purge journey logs from system database."""
        JourneyHistoryService.get_journey_by_id(db, journey_id=journey_id, user_id=user_id)
        return journey_repository.remove(db, id=journey_id)
