from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.contact import contact_repository
from app.models.contact import EmergencyContact
from app.schemas.contact import EmergencyContactCreate, EmergencyContactUpdate

class EmergencyContactService:
    @staticmethod
    def get_contact_by_id(db: Session, contact_id: int, user_id: int) -> EmergencyContact:
        """Fetch emergency contact verify ownership, raises 404 if missing or unowned."""
        contact = contact_repository.get(db, id=contact_id)
        if not contact or contact.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emergency contact not found or unauthorized access"
            )
        return contact

    @staticmethod
    def get_contacts_for_user(db: Session, user_id: int) -> List[EmergencyContact]:
        """Fetch all contact records registered under user."""
        return contact_repository.get_by_user_id(db, user_id=user_id)

    @staticmethod
    def create_contact(db: Session, obj_in: EmergencyContactCreate, user_id: int) -> EmergencyContact:
        """Create new emergency contact, resetting other primary status checks if marked primary."""
        if obj_in.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mismatch user validation context"
            )
        
        # If marked primary, reset others first
        if obj_in.is_primary:
            EmergencyContactService._reset_primary_statuses(db, user_id)

        return contact_repository.create(db, obj_in=obj_in)

    @staticmethod
    def update_contact(
        db: Session, 
        contact_id: int, 
        obj_in: EmergencyContactUpdate, 
        user_id: int
    ) -> EmergencyContact:
        """Update contact properties, ensuring only one primary contact exists."""
        contact = EmergencyContactService.get_contact_by_id(db, contact_id=contact_id, user_id=user_id)
        
        # Handle primary status switch
        if obj_in.is_primary:
            EmergencyContactService._reset_primary_statuses(db, user_id)
            
        return contact_repository.update(db, db_obj=contact, obj_in=obj_in)

    @staticmethod
    def delete_contact(db: Session, contact_id: int, user_id: int) -> EmergencyContact:
        """Delete contact after verifying ownership checks."""
        EmergencyContactService.get_contact_by_id(db, contact_id=contact_id, user_id=user_id)
        return contact_repository.remove(db, id=contact_id)

    @staticmethod
    def mark_primary_contact(db: Session, contact_id: int, user_id: int) -> EmergencyContact:
        """Explicit service setting single target contact as primary, clearing previous fields."""
        contact = EmergencyContactService.get_contact_by_id(db, contact_id=contact_id, user_id=user_id)
        
        # Reset primary fields on other contacts
        EmergencyContactService._reset_primary_statuses(db, user_id)
        
        # Set this one
        contact.is_primary = True
        db.add(contact)
        db.commit()
        db.refresh(contact)
        return contact

    @staticmethod
    def _reset_primary_statuses(db: Session, user_id: int):
        """Internal helper to clear primary contact flag from all contacts of a user."""
        db.query(EmergencyContact).filter(
            EmergencyContact.user_id == user_id, 
            EmergencyContact.is_primary == True
        ).update({"is_primary": False})
        db.commit()
