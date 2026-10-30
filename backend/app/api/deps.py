from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    x_guest_id: Optional[str] = Header(None, alias="X-Guest-ID"),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Resolves the current authenticated user or persistent guest user.
    Enforces authorization across all chart and chat endpoints.
    """
    user: Optional[User] = None

    # 1. Bearer JWT Token
    if auth and auth.credentials:
        payload = decode_token(auth.credentials)
        if payload and "sub" in payload:
            user_id = payload["sub"]
            stmt = select(User).where(User.id == user_id)
            user = (await db.execute(stmt)).scalar_one_or_none()

    # 2. Guest Session Identifier
    if not user and x_guest_id:
        stmt = select(User).where(User.id == x_guest_id, User.is_guest == True)
        user = (await db.execute(stmt)).scalar_one_or_none()

    # 3. If neither or not found, create a persistent guest user automatically
    if not user:
        user = User(is_guest=True)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info(f"Initialized new guest session user: {user.id}")

    return user
