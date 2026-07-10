from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import UserCreate, User
from app.schemas.token import Token
from app.services.user import UserService
from app.services.auth import AuthService
from pydantic import BaseModel, EmailStr
from typing import Optional

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
async def login(request: Request, db: Session = Depends(get_db)):
    email = None
    password = None
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password credentials"
        )

    user = AuthService.authenticate_user(
        db, 
        email=email, 
        password=password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password credentials"
        )
    return AuthService.generate_token_for_user(user)
