from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import UserCreate, User
from app.schemas.token import Token
from app.services.user import UserService
from app.services.auth import AuthService
from pydantic import BaseModel, EmailStr

router = APIRouter()

@router.post(
    "/signup", 
    response_model=User, 
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description="Registers user profiles and hashes password credentials securely."
)
def signup(obj_in: UserCreate, db: Session = Depends(get_db)):
    return UserService.create_user(db, obj_in=obj_in)

@router.post(
    "/login", 
    response_model=Token,
    summary="User Authenticate and Access Token retrieval",
    description="Validates credentials and issues signed bearer JWT tokens."
)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = AuthService.authenticate_user(
        db, 
        email=form_data.username, 
        password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password credentials"
        )
    return AuthService.generate_token_for_user(user)
