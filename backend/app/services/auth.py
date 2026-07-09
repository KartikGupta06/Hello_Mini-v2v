from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.user import user_repository
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.schemas.token import Token

class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user credentials using password verification hashes."""
        user = user_repository.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def generate_token_for_user(user: User) -> Token:
        """Issue access signed JWT authorization tokens for validated user accounts."""
        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token, token_type="bearer")
