from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.repositories.user import user_repository
from app.models.user import User
from app.schemas.token import TokenData

# OAuth2 bearer token scheme resolver
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"/api/{settings.API_VERSION}/auth/login", 
    auto_error=False
)

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    """Verifies JWT token validity and resolves active database User profile."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(sub=user_id)
    except JWTError:
        raise credentials_exception
        
    try:
        user_id_int = int(token_data.sub)
    except ValueError:
        raise credentials_exception

    user = user_repository.get(db, id=user_id_int)
    if user is None:
        raise credentials_exception
    return user
