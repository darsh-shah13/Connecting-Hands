"""Pydantic models for persistence + sharing flows."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreateRequest(BaseModel):
    """Create a lightweight user."""

    display_name: str = Field(default="", max_length=120)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    display_name: str
    created_at: datetime


class SessionCreateRequest(BaseModel):
    inviter_user_id: str


class SessionJoinRequest(BaseModel):
    share_code: str
    partner_user_id: str


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    share_code: str
    inviter_user_id: str
    partner_user_id: str | None
    created_at: datetime
    paired_at: datetime | None


class HandModelBase64UploadRequest(BaseModel):
    owner_user_id: str
    glb_base64: str = Field(..., description="Base64-encoded GLB file bytes")
    content_type: str = Field(default="model/gltf-binary")


class HandModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    owner_user_id: str
    storage_key: str
    file_size_bytes: int
    content_type: str
    created_at: datetime
    retrieved_at: datetime | None
    confirmed_at: datetime | None

    download_url: str | None = None


class PollResponse(BaseModel):
    session: SessionResponse
    latest_model: HandModelResponse | None
    has_new_model: bool
