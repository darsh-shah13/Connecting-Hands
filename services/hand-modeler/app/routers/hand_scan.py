"""Hand scan router."""

import uuid
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.models.hand_detection import HandDetectionResponse, HandPoint
from app.models.hand_scan import HandScanResponse, DeviceMetadata
import json

router = APIRouter()


@router.post("/hands/scan", response_model=HandScanResponse)
async def submit_hand_scan(
    frames: list[UploadFile] = File(...),
    metadata: str = Form(...),
    timestamp: str = Form(...),
) -> HandScanResponse:
    """Submit hand scan with captured frames.

    Args:
        frames: List of captured frame images
        metadata: Device metadata as JSON string
        timestamp: Unix timestamp of the scan

    Returns:
        Hand scan response with scan ID
    """
    if not frames or len(frames) == 0:
        raise HTTPException(status_code=400, detail="No frames provided")

    if len(frames) < 3:
        raise HTTPException(
            status_code=400, detail="At least 3 frames required"
        )

    try:
        # Parse metadata
        device_metadata = json.loads(metadata)

        # In a real implementation, this would:
        # 1. Save frames to storage
        # 2. Run hand detection on frames
        # 3. Extract landmarks and hand pose
        # 4. Store scan data in database

        # Generate scan ID
        scan_id = f"scan_{uuid.uuid4().hex[:12]}"

        # Placeholder landmarks - in real impl, these would
        # come from ML model
        landmarks = [
            {
                "x": 0.5,
                "y": 0.4,
                "z": 0.0,
                "confidence": 0.95,
            },
            {
                "x": 0.52,
                "y": 0.42,
                "z": 0.01,
                "confidence": 0.92,
            },
        ]

        return HandScanResponse(
            success=True,
            scan_id=scan_id,
            landmarks=landmarks,
            message="Hand scan submitted successfully",
        )

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid metadata format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing hand scan: {str(e)}",
        )


@router.post("/hands/detect")
async def detect_hand_landmarks(
    frame: UploadFile = File(...),
) -> dict[str, list[dict[str, float]]]:
    """Detect hand landmarks in a single frame.

    Args:
        frame: Image file containing hand

    Returns:
        Dictionary with detected landmarks
    """
    if not frame:
        raise HTTPException(status_code=400, detail="Frame required")

    try:
        # In a real implementation, this would:
        # 1. Read the image from the uploaded file
        # 2. Run hand detection model
        # 3. Return detected landmarks

        # Placeholder landmarks
        landmarks = [
            {
                "x": 0.5,
                "y": 0.4,
                "z": 0.0,
                "confidence": 0.95,
            },
            {
                "x": 0.52,
                "y": 0.42,
                "z": 0.01,
                "confidence": 0.92,
            },
        ]

        return {"landmarks": landmarks}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error detecting landmarks: {str(e)}",
        )
