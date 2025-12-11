"""Hand scan models."""

from pydantic import BaseModel, Field


class DeviceMetadata(BaseModel):
    """Device metadata captured during scan."""

    camera_type: str = Field(
        ..., description="Camera type used (front or back)"
    )
    zoom: float = Field(
        default=1.0, ge=1.0, description="Camera zoom level"
    )
    flash_mode: str = Field(
        default="off", description="Flash mode (off, on, auto)"
    )


class HandScanRequest(BaseModel):
    """Request model for hand scan submission."""

    metadata: DeviceMetadata
    timestamp: int = Field(..., description="Unix timestamp of scan")


class HandScanResponse(BaseModel):
    """Response model for hand scan submission."""

    success: bool
    scan_id: str = Field(..., description="Unique scan identifier")
    landmarks: list[dict[str, float]] = Field(
        default_factory=list, description="Detected hand landmarks"
    )
    message: str = Field(default="", description="Response message")
