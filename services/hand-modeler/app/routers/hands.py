"""Hand scan ingestion and meshing router."""

from __future__ import annotations

import base64
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile

from app.config import settings
from app.jobs import store
from app.models.hand_scan import (
    HandMeshMetadata,
    HandScanCreateResponse,
    HandScanStatusResponse,
)
from app.services.hands.detector import (
    LandmarkDetector,
    MediapipeHandsDetector,
    UnavailableLandmarkDetector,
)
from app.services.hands.job_processor import process_hand_scan_job

router = APIRouter()


def get_jobs_dir() -> Path:
    jobs_dir = Path(settings.jobs_dir)
    jobs_dir.mkdir(parents=True, exist_ok=True)
    return jobs_dir


def get_landmark_detector() -> LandmarkDetector:
    try:
        return MediapipeHandsDetector()
    except RuntimeError:
        return UnavailableLandmarkDetector(
            "Landmark detection is unavailable (mediapipe not installed). "
            "Install backend extras or provide your own detector implementation."
        )


@router.post("/hands/scan", response_model=HandScanCreateResponse)
async def create_hand_scan(
    background_tasks: BackgroundTasks,
    frames: list[UploadFile] = File(...),
    jobs_dir: Path = Depends(get_jobs_dir),
    detector: LandmarkDetector = Depends(get_landmark_detector),
) -> HandScanCreateResponse:
    if not frames:
        raise HTTPException(status_code=400, detail="At least one frame is required")

    job_id = str(uuid4())
    job_dir = store.get_job_dir(jobs_dir, job_id)
    frames_dir = job_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    frame_paths: list[Path] = []
    for idx, frame in enumerate(frames):
        suffix = Path(frame.filename or "frame").suffix or ".bin"
        out_path = frames_dir / f"frame_{idx:05d}{suffix}"
        out_path.write_bytes(await frame.read())
        frame_paths.append(out_path)

    store.create_job(jobs_dir, job_id, frame_files=[str(p) for p in frame_paths])

    background_tasks.add_task(
        process_hand_scan_job,
        jobs_dir=jobs_dir,
        job_id=job_id,
        frame_paths=frame_paths,
        detector=detector,
    )

    return HandScanCreateResponse(job_id=job_id, status="queued")


@router.get("/hands/{job_id}", response_model=HandScanStatusResponse)
async def get_hand_scan(
    job_id: str,
    jobs_dir: Path = Depends(get_jobs_dir),
) -> HandScanStatusResponse:
    record = store.read_job_record(jobs_dir, job_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Job not found")

    metadata: HandMeshMetadata | None = None
    glb_base64: str | None = None

    if record.status == "completed":
        metadata_dict = store.read_metadata(jobs_dir, job_id)
        if metadata_dict is not None:
            metadata = HandMeshMetadata.model_validate(metadata_dict)

        glb = store.read_glb(jobs_dir, job_id)
        if glb is not None:
            glb_base64 = base64.b64encode(glb).decode("ascii")

    return HandScanStatusResponse(
        job_id=record.job_id,
        status=record.status,
        created_at=record.created_at,
        updated_at=record.updated_at,
        error=record.error,
        metadata=metadata,
        glb_base64=glb_base64,
    )
