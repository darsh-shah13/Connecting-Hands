"""Hand scan and meshing API models."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class HandLandmark(BaseModel):
    """A 3D point representing a hand landmark."""

    x: float
    y: float
    z: float
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)


class HandMeshMetadata(BaseModel):
    """Derived metadata for a hand scan."""

    landmarks: list[HandLandmark] = Field(
        default_factory=list,
        description="Normalized 3D landmarks (21 points) in model space",
    )
    fingertips: dict[str, HandLandmark] = Field(
        default_factory=dict,
        description="Convenience mapping of fingertip name -> landmark",
    )
    joints: dict[str, dict[str, HandLandmark]] = Field(
        default_factory=dict,
        description="Finger joint mapping finger -> joint_name -> landmark",
    )
    finger_lengths: dict[str, float] = Field(
        default_factory=dict,
        description="Finger length estimates computed from landmark segment lengths",
    )
    articulation_degrees: dict[str, dict[str, float]] = Field(
        default_factory=dict,
        description="Estimated joint angles (in degrees) per finger",
    )


class HandScanCreateResponse(BaseModel):
    """Response returned after a scan has been accepted for processing."""

    job_id: str
    status: str


class HandScanStatusResponse(BaseModel):
    """Status/result for a hand scan job."""

    job_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    error: str | None = None

    metadata: HandMeshMetadata | None = None
    glb_base64: str | None = Field(
        default=None,
        description="Base64-encoded binary glTF (GLB) if job is completed",
    )

    debug: dict[str, Any] | None = None
