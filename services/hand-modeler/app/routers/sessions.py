"""Pairing session router."""

from __future__ import annotations

import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import HandModel, Session as PairSession, User
from app.db.session import get_db
from app.models.sharing import (
    HandModelResponse,
    PollResponse,
    SessionCreateRequest,
    SessionJoinRequest,
    SessionResponse,
)
from app.storage import generate_signed_download_url

router = APIRouter()

_SHARE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _get_user_or_404(db: Session, user_id: str) -> User:
    user = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _get_session_or_404(db: Session, session_id: str) -> PairSession:
    session = (
        db.execute(select(PairSession).where(PairSession.id == session_id)).scalars().first()
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


def _generate_unique_share_code(db: Session, length: int = 6) -> str:
    for _ in range(30):
        code = "".join(secrets.choice(_SHARE_CODE_ALPHABET) for _ in range(length))
        existing = (
            db.execute(select(PairSession).where(PairSession.share_code == code)).scalars().first()
        )
        if existing is None:
            return code

    raise HTTPException(status_code=500, detail="Unable to generate share code")


@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    request: SessionCreateRequest, db: Session = Depends(get_db)
) -> SessionResponse:
    """Create a pairing session and return a share code."""

    _get_user_or_404(db, request.inviter_user_id)

    share_code = _generate_unique_share_code(db)
    session = PairSession(
        id=secrets.token_hex(16),
        share_code=share_code,
        inviter_user_id=request.inviter_user_id,
        partner_user_id=None,
        paired_at=None,
    )
    db.add(session)
    db.commit()

    return SessionResponse.model_validate(session)


@router.post("/sessions/join", response_model=SessionResponse)
async def join_session(
    request: SessionJoinRequest, db: Session = Depends(get_db)
) -> SessionResponse:
    """Join a pairing session using a share code."""

    _get_user_or_404(db, request.partner_user_id)

    session = (
        db.execute(select(PairSession).where(PairSession.share_code == request.share_code))
        .scalars()
        .first()
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.partner_user_id is not None and session.partner_user_id != request.partner_user_id:
        raise HTTPException(status_code=409, detail="Session already paired")

    if session.inviter_user_id == request.partner_user_id:
        raise HTTPException(status_code=400, detail="Inviter and partner must be different users")

    if session.partner_user_id is None:
        session.partner_user_id = request.partner_user_id
        session.paired_at = _utcnow()
        db.add(session)
        db.commit()

    return SessionResponse.model_validate(session)


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: Session = Depends(get_db)) -> SessionResponse:
    """Get session details."""

    session = _get_session_or_404(db, session_id)
    return SessionResponse.model_validate(session)


@router.get("/sessions/{session_id}/poll", response_model=PollResponse)
async def poll_session(
    request: Request,
    session_id: str,
    after_hand_model_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> PollResponse:
    """Polling endpoint for partners to check for newly available models."""

    session = _get_session_or_404(db, session_id)

    latest = (
        db.execute(
            select(HandModel)
            .where(HandModel.session_id == session_id)
            .order_by(HandModel.created_at.desc())
            .limit(1)
        )
        .scalars()
        .first()
    )

    latest_response: HandModelResponse | None = None
    if latest is not None:
        latest_response = HandModelResponse.model_validate(latest)
        latest_response.download_url = generate_signed_download_url(
            request=request, key=latest.storage_key
        )

    has_new_model = latest is not None and latest.id != after_hand_model_id

    return PollResponse(
        session=SessionResponse.model_validate(session),
        latest_model=latest_response,
        has_new_model=has_new_model,
    )
