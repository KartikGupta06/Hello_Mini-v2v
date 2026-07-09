from typing import List
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.contact import EmergencyContact
from app.schemas.contact import EmergencyContactCreate, EmergencyContactUpdate

class EmergencyContactRepository(
    BaseRepository[EmergencyContact, EmergencyContactCreate, EmergencyContactUpdate]
):
    def get_by_user_id(self, db: Session, user_id: int) -> List[EmergencyContact]:
        """Fetch all emergency contacts registered under a specific user."""
        return db.query(self.model).filter(self.model.user_id == user_id).all()

contact_repository = EmergencyContactRepository(EmergencyContact)
