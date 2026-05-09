"""Auth endpoint — register, login, get profile"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str
    phone: str          # India-first → phone as primary identifier
    email: EmailStr | None = None
    password: str
    state: str | None = None    # Indian state for regional alerts
    preferred_language: str = "en"   # "en" or "hi"


class LoginRequest(BaseModel):
    phone: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new farmer account"""
    # TODO: check if phone already exists in DB
    # hashed = hash_password(payload.password)
    # user = User(name=payload.name, phone=payload.phone, ...)
    # db.add(user); await db.commit()
    
    # Placeholder response for scaffold
    fake_user_id = "usr_demo_001"
    token = create_access_token({"sub": fake_user_id})
    return TokenResponse(access_token=token, user_id=fake_user_id, name=payload.name)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with phone + password"""
    # TODO: fetch user from DB, verify password
    # user = await db.execute(select(User).where(User.phone == payload.phone))
    # if not verify_password(payload.password, user.hashed_password): raise 401

    fake_user_id = "usr_demo_001"
    token = create_access_token({"sub": fake_user_id})
    return TokenResponse(access_token=token, user_id=fake_user_id, name="Demo Farmer")


@router.get("/me")
async def get_me(current_user_id: str = Depends(get_current_user)):
    """Get current user profile"""
    return {"user_id": current_user_id, "message": "Profile endpoint — connect to DB"}
