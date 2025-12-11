"""SQLAlchemy ORM models for persistence and sharing."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    """A lightweight user record.

    Auth is out of scope for now; clients create a user and pass its id.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    invited_sessions: Mapped[list[Session]] = relationship(
        "Session", foreign_keys="Session.inviter_user_id", back_populates="inviter"
    )
    partnered_sessions: Mapped[list[Session]] = relationship(
        "Session", foreign_keys="Session.partner_user_id", back_populates="partner"
    )


class Session(Base):
    """A pairing session used to share models between two users."""

    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    share_code: Mapped[str] = mapped_column(String(16), unique=True, index=True)

    inviter_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    partner_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    paired_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    inviter: Mapped[User] = relationship(
        "User", foreign_keys=[inviter_user_id], back_populates="invited_sessions"
    )
    partner: Mapped[User | None] = relationship(
        "User", foreign_keys=[partner_user_id], back_populates="partnered_sessions"
    )

    hand_models: Mapped[list[HandModel]] = relationship(
        "HandModel", back_populates="session", cascade="all, delete-orphan"
    )


class HandModel(Base):
    """A generated GLB hand model stored in object storage."""

    __tablename__ = "hand_models"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), index=True)
    owner_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)

    storage_key: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    content_type: Mapped[str] = mapped_column(String(128), default="model/gltf-binary")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, index=True
    )
    retrieved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    session: Mapped[Session] = relationship("Session", back_populates="hand_models")
    owner: Mapped[User] = relationship("User")
