"""Background job processing for hand scan uploads."""

from __future__ import annotations

from pathlib import Path

from app.jobs import store
from app.models.hand_scan import HandMeshMetadata
from app.services.hands.detector import Landmark, LandmarkDetector
from app.services.hands.meshing import export_mesh_glb, generate_hand_mesh
from app.services.hands.processing import (
    HAND_LANDMARK_COUNT,
    aggregate_landmarks,
    compute_metadata,
    landmarks_to_array,
    normalize_landmarks,
    smooth_trajectories,
)


def process_hand_scan_job(
    *,
    jobs_dir: Path,
    job_id: str,
    frame_paths: list[Path],
    detector: LandmarkDetector,
) -> None:
    """Run landmark detection, smoothing, mesh generation, and persistence."""

    store.update_job(jobs_dir, job_id, status="processing", error=None)

    try:
        frames: list[list[Landmark]] = []
        for frame_path in frame_paths:
            image_bytes = frame_path.read_bytes()
            landmarks = detector.detect(image_bytes)
            if len(landmarks) != HAND_LANDMARK_COUNT:
                raise ValueError(
                    f"Expected {HAND_LANDMARK_COUNT} landmarks, got {len(landmarks)}"
                )
            frames.append(landmarks)

        trajectories = landmarks_to_array(frames)
        trajectories = smooth_trajectories(trajectories, window=5)
        points = aggregate_landmarks(trajectories)
        points = normalize_landmarks(points)

        metadata: HandMeshMetadata = compute_metadata(points)

        mesh = generate_hand_mesh(points)
        glb = export_mesh_glb(mesh)

        metadata_json = metadata.model_dump_json(indent=2)
        metadata_path = store.write_metadata(jobs_dir, job_id, metadata_json)
        glb_path = store.write_glb(jobs_dir, job_id, glb)

        store.update_job(
            jobs_dir,
            job_id,
            status="completed",
            metadata_file=metadata_path,
            glb_file=glb_path,
            error=None,
        )
    except Exception as exc:  # pragma: no cover
        store.update_job(jobs_dir, job_id, status="failed", error=str(exc))
