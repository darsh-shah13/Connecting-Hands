"""User management router (lightweight, unauthenticated)."""

from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.models.sharing import UserCreateRequest, UserResponse

router = APIRouter()


@router.post("/users", response_model=UserResponse)
async def create_user(request: UserCreateRequest, db: Session = Depends(get_db)) -> UserResponse:
    """Create a user.

    This is intentionally minimal to support pairing + sharing in a demo setting.
    """

    display_name = request.display_name.strip() or "User"
    user = User(id=str(uuid4()), display_name=display_name)
    db.add(user)
    db.commit()

    return UserResponse.model_validate(user)


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: Session = Depends(get_db)) -> UserResponse:
    """Fetch a user by id."""

    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse.model_validate(user)
