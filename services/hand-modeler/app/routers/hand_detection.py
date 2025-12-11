"""Hand detection router."""

from fastapi import APIRouter, HTTPException

from app.models.hand_detection import (
    HandDetectionRequest,
    HandDetectionResponse,
    HandPoint,
)

router = APIRouter()


@router.post("/detect", response_model=HandDetectionResponse)
async def detect_hand(request: HandDetectionRequest) -> HandDetectionResponse:
    """Detect hand landmarks in the provided image.

    Args:
        request: Hand detection request containing image data

    Returns:
        Hand detection response with detected landmarks
    """
    if not request.image_data:
        raise HTTPException(status_code=400, detail="Image data is required")

    # Placeholder: In a real implementation, this would run the ML model
    # to detect hand landmarks from the image
    hand_landmarks = [
        HandPoint(x=0.5, y=0.5, z=0.0, confidence=0.95),
        HandPoint(x=0.51, y=0.52, z=0.01, confidence=0.92),
    ]

    return HandDetectionResponse(
        success=True,
        landmarks=hand_landmarks,
        confidence=0.93,
        message="Hand detected successfully",
    )


@router.get("/models")
async def list_models() -> dict[str, list[str]]:
    """List available hand detection models."""
    return {"models": ["hand-landmarks-v1", "hand-pose-v1"]}
