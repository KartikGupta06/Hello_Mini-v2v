from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User as UserModel
from app.schemas.user import User, UserUpdate
from app.services.user import UserService

router = APIRouter()

@router.get(
    "/me", 
    response_model=User,
    summary="Get active user profile details",
    description="Resolves access headers to return current authenticated user credentials."
)
def get_user_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.put(
    "/me", 
    response_model=User,
    summary="Update active user profile details",
    description="Apply details updates on currently authenticated account."
)
def update_user_me(
    obj_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return UserService.update_user(db, user_id=current_user.id, obj_in=obj_in)

@router.delete(
    "/me", 
    response_model=User,
    summary="Unsubscribe/delete active account",
    description="Purges active user accounts record logs from the system."
)
def delete_user_me(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return UserService.delete_user(db, user_id=current_user.id)
