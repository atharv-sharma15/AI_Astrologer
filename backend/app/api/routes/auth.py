from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/guest", response_model=TokenResponse)
async def create_guest_session(db: AsyncSession = Depends(get_db)):
    """
    Creates an instant guest session so users can upload and chat immediately
    without an upfront registration barrier.
    """
    guest_user = User(is_guest=True)
    db.add(guest_user)
    await db.commit()
    await db.refresh(guest_user)

    token = create_access_token({"sub": guest_user.id, "is_guest": True})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(guest_user)
    )


@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a permanent user with email and securely hashed password.
    """
    stmt = select(User).where(User.email == user_in.email)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    hashed_pw = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        is_guest=False
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "is_guest": False})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticates user and returns JWT access token.
    """
    stmt = select(User).where(User.email == credentials.email)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": user.id, "email": user.email, "is_guest": False})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns profile information for current session.
    """
    return UserResponse.model_validate(current_user)
