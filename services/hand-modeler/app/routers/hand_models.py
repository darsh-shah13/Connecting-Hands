"""Hand model upload and retrieval router."""

from __future__ import annotations

import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import HandModel, Session as PairSession, User
from app.db.session import get_db
from app.models.sharing import HandModelBase64UploadRequest, HandModelResponse
from app.storage import generate_signed_download_url, save_base64_bytes, save_upload_file

router = APIRouter()


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


def _ensure_user_in_session(session: PairSession, user_id: str) -> None:
    if user_id not in {session.inviter_user_id, session.partner_user_id}:
        raise HTTPException(status_code=403, detail="User is not part of this session")


def _max_model_size_bytes() -> int:
    return settings.max_model_size_mb * 1024 * 1024


@router.post("/sessions/{session_id}/hand-models", response_model=HandModelResponse)
async def upload_hand_model(
    request: Request,
    session_id: str,
    owner_user_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> HandModelResponse:
    """Upload a GLB file for a pairing session."""

    _get_user_or_404(db, owner_user_id)
    session = _get_session_or_404(db, session_id)
    _ensure_user_in_session(session, owner_user_id)

    hand_model_id = str(secrets.token_hex(16))
    storage_key = f"hand-models/{session_id}/{hand_model_id}.glb"

    size = save_upload_file(key=storage_key, upload=file, max_size_bytes=_max_model_size_bytes())

    content_type = file.content_type or "model/gltf-binary"

    model = HandModel(
        id=hand_model_id,
        session_id=session_id,
        owner_user_id=owner_user_id,
        storage_key=storage_key,
        file_size_bytes=size,
        content_type=content_type,
        created_at=_utcnow(),
    )
    db.add(model)
    db.commit()

    response = HandModelResponse.model_validate(model)
    response.download_url = generate_signed_download_url(request=request, key=storage_key)
    return response


@router.post("/sessions/{session_id}/hand-models/base64", response_model=HandModelResponse)
async def upload_hand_model_base64(
    request: Request,
    session_id: str,
    payload: HandModelBase64UploadRequest,
    db: Session = Depends(get_db),
) -> HandModelResponse:
    """Upload a GLB file in base64 form (mobile-friendly fallback)."""

    _get_user_or_404(db, payload.owner_user_id)
    session = _get_session_or_404(db, session_id)
    _ensure_user_in_session(session, payload.owner_user_id)

    hand_model_id = str(secrets.token_hex(16))
    storage_key = f"hand-models/{session_id}/{hand_model_id}.glb"

    size = save_base64_bytes(
        key=storage_key, data_base64=payload.glb_base64, max_size_bytes=_max_model_size_bytes()
    )

    model = HandModel(
        id=hand_model_id,
        session_id=session_id,
        owner_user_id=payload.owner_user_id,
        storage_key=storage_key,
        file_size_bytes=size,
        content_type=payload.content_type,
        created_at=_utcnow(),
    )
    db.add(model)
    db.commit()

    response = HandModelResponse.model_validate(model)
    response.download_url = generate_signed_download_url(request=request, key=storage_key)
    return response


@router.get("/hand-models/{hand_model_id}", response_model=HandModelResponse)
async def get_hand_model(
    request: Request,
    hand_model_id: str,
    viewer_user_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> HandModelResponse:
    """Get hand model metadata.

    If the viewer is the session partner, this will mark the model as retrieved.
    """

    model = db.execute(select(HandModel).where(HandModel.id == hand_model_id)).scalar_one_or_none()
    if model is None:
        raise HTTPException(status_code=404, detail="Hand model not found")

    session = _get_session_or_404(db, model.session_id)

    if viewer_user_id is not None:
        _get_user_or_404(db, viewer_user_id)
        _ensure_user_in_session(session, viewer_user_id)
        if session.partner_user_id == viewer_user_id and model.retrieved_at is None:
            model.retrieved_at = _utcnow()
            db.add(model)
            db.commit()

    response = HandModelResponse.model_validate(model)
    response.download_url = generate_signed_download_url(request=request, key=model.storage_key)
    return response


@router.get("/sessions/{session_id}/hand-models/latest", response_model=HandModelResponse)
async def get_latest_hand_model(
    request: Request, session_id: str, db: Session = Depends(get_db)
) -> HandModelResponse:
    """Get the latest uploaded hand model for a session."""

    _get_session_or_404(db, session_id)

    model = (
        db.execute(
            select(HandModel)
            .where(HandModel.session_id == session_id)
            .order_by(HandModel.created_at.desc())
            .limit(1)
        )
        .scalars()
        .first()
    )
    if model is None:
        raise HTTPException(status_code=404, detail="No models uploaded for this session")

    response = HandModelResponse.model_validate(model)
    response.download_url = generate_signed_download_url(request=request, key=model.storage_key)
    return response


@router.post("/hand-models/{hand_model_id}/confirm", response_model=HandModelResponse)
async def confirm_delivery(
    request: Request,
    hand_model_id: str,
    partner_user_id: str = Form(...),
    db: Session = Depends(get_db),
) -> HandModelResponse:
    """Confirm delivery after the partner has successfully downloaded/processed the model."""

    model = db.execute(select(HandModel).where(HandModel.id == hand_model_id)).scalar_one_or_none()
    if model is None:
        raise HTTPException(status_code=404, detail="Hand model not found")

    session = _get_session_or_404(db, model.session_id)

    _get_user_or_404(db, partner_user_id)
    if session.partner_user_id != partner_user_id:
        raise HTTPException(status_code=403, detail="Only the partner can confirm delivery")

    if model.confirmed_at is None:
        model.confirmed_at = _utcnow()
        db.add(model)
        db.commit()

    response = HandModelResponse.model_validate(model)
    response.download_url = generate_signed_download_url(request=request, key=model.storage_key)
    return response
