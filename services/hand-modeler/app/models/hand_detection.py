"""Hand detection models."""

from pydantic import BaseModel, Field


class HandPoint(BaseModel):
    """A 3D point representing a hand landmark."""

    x: float = Field(..., ge=0.0, le=1.0, description="X coordinate (0-1)")
    y: float = Field(..., ge=0.0, le=1.0, description="Y coordinate (0-1)")
    z: float = Field(
        ..., ge=-1.0, le=1.0, description="Z coordinate (depth, -1 to 1)"
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence score for this point"
    )


class HandDetectionRequest(BaseModel):
    """Request model for hand detection."""

    image_data: str = Field(..., description="Base64 encoded image data")
    model: str = Field(
        default="hand-landmarks-v1", description="Model to use for detection"
    )


class HandDetectionResponse(BaseModel):
    """Response model for hand detection."""

    success: bool
    landmarks: list[HandPoint] = Field(
        default_factory=list, description="Detected hand landmarks"
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Overall confidence of the detection"
    )
    message: str = Field(default="", description="Response message")
