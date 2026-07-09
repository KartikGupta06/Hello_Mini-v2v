from typing import List
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.journey import JourneyHistory
from app.schemas.journey import JourneyHistoryCreate, JourneyHistoryUpdate

class JourneyHistoryRepository(
    BaseRepository[JourneyHistory, JourneyHistoryCreate, JourneyHistoryUpdate]
):
    def get_by_user_id(self, db: Session, user_id: int) -> List[JourneyHistory]:
        """Fetch full historical journey logs registered under a specific user."""
        return db.query(self.model).filter(self.model.user_id == user_id).all()

journey_repository = JourneyHistoryRepository(JourneyHistory)
