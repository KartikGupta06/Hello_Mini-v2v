from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User as UserModel
from app.schemas.contact import EmergencyContact, EmergencyContactCreate, EmergencyContactUpdate
from app.services.contact import EmergencyContactService

router = APIRouter()

@router.get(
    "/", 
    response_model=List[EmergencyContact],
    summary="List all emergency contacts",
    description="Returns contact listings registered under current authenticated user account."
)
def get_contacts(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return EmergencyContactService.get_contacts_for_user(db, user_id=current_user.id)

@router.post(
    "/", 
    response_model=EmergencyContact,
    status_code=status.HTTP_201_CREATED,
    summary="Add new trust contact",
    description="Saves a new emergency contact record under current user account."
)
def create_contact(
    obj_in: EmergencyContactCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return EmergencyContactService.create_contact(
        db, 
        obj_in=obj_in, 
        user_id=current_user.id
    )

@router.put(
    "/{contact_id}", 
    response_model=EmergencyContact,
    summary="Modify contact details",
    description="Update numbers, names, relationships, or primary statuses."
)
def update_contact(
    contact_id: int,
    obj_in: EmergencyContactUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return EmergencyContactService.update_contact(
        db, 
        contact_id=contact_id, 
        obj_in=obj_in, 
        user_id=current_user.id
    )

@router.delete(
    "/{contact_id}", 
    response_model=EmergencyContact,
    summary="Remove trust contact",
    description="Purges specific emergency contact logs from database."
)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return EmergencyContactService.delete_contact(
        db, 
        contact_id=contact_id, 
        user_id=current_user.id
    )

@router.post(
    "/{contact_id}/primary", 
    response_model=EmergencyContact,
    summary="Mark contact as primary alert target",
    description="Sets a single target contact as primary, clearing previous flags."
)
def mark_primary_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return EmergencyContactService.mark_primary_contact(
        db, 
        contact_id=contact_id, 
        user_id=current_user.id
    )
