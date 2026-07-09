from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user import user_repository
from app.models.user import User
from app.schemas.user import UserUpdate, UserCreate
from app.core.security import get_password_hash

class UserService:
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Fetch user by primary key ID, raises 404 if missing."""
        user = user_repository.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="User profile not found"
            )
        return user

    @staticmethod
    def create_user(db: Session, obj_in: UserCreate) -> User:
        """Create new user checking email collisions."""
        existing = user_repository.get_by_email(db, email=obj_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address already registered"
            )
        return user_repository.create(db, obj_in=obj_in)

    @staticmethod
    def update_user(db: Session, user_id: int, obj_in: UserUpdate) -> User:
        """Apply user modifications, automatically rehashing password if updated."""
        user = UserService.get_user_by_id(db, user_id=user_id)
        
        # Check email availability if email is changing
        if obj_in.email and obj_in.email != user.email:
            existing = user_repository.get_by_email(db, email=obj_in.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email address already in use by another account"
                )

        # Prepare update dict
        update_data = obj_in.model_dump(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))

        for field in update_data:
            setattr(user, field, update_data[field])

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> User:
        """Delete user account from system."""
        # Ensure user exists first
        UserService.get_user_by_id(db, user_id=user_id)
        return user_repository.remove(db, id=user_id)
