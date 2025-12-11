"""Landmark smoothing, normalization, and metadata derivation."""

from __future__ import annotations

import math
from typing import Final

import numpy as np
from numpy.typing import NDArray

from app.models.hand_scan import HandLandmark, HandMeshMetadata
from app.services.hands.detector import Landmark

HAND_LANDMARK_COUNT: Final[int] = 21

FINGER_LANDMARKS: Final[dict[str, list[int]]] = {
    "thumb": [0, 1, 2, 3, 4],
    "index": [0, 5, 6, 7, 8],
    "middle": [0, 9, 10, 11, 12],
    "ring": [0, 13, 14, 15, 16],
    "pinky": [0, 17, 18, 19, 20],
}

FINGERTIP_INDEX: Final[dict[str, int]] = {
    "thumb": 4,
    "index": 8,
    "middle": 12,
    "ring": 16,
    "pinky": 20,
}

JOINTS_BY_FINGER: Final[dict[str, dict[str, int]]] = {
    "thumb": {"mcp": 2, "ip": 3, "tip": 4},
    "index": {"mcp": 5, "pip": 6, "dip": 7, "tip": 8},
    "middle": {"mcp": 9, "pip": 10, "dip": 11, "tip": 12},
    "ring": {"mcp": 13, "pip": 14, "dip": 15, "tip": 16},
    "pinky": {"mcp": 17, "pip": 18, "dip": 19, "tip": 20},
}


def landmarks_to_array(frames: list[list[Landmark]]) -> NDArray[np.float64]:
    """Convert landmark frames to an ndarray of shape (T, 21, 3)."""

    if not frames:
        raise ValueError("At least one frame of landmarks is required")

    arr = np.zeros((len(frames), HAND_LANDMARK_COUNT, 3), dtype=np.float64)

    for t, frame in enumerate(frames):
        if len(frame) != HAND_LANDMARK_COUNT:
            raise ValueError(
                f"Expected {HAND_LANDMARK_COUNT} landmarks per frame, got {len(frame)}"
            )
        for i, lm in enumerate(frame):
            arr[t, i, 0] = lm.x
            arr[t, i, 1] = lm.y
            arr[t, i, 2] = lm.z

    return arr


def smooth_trajectories(
    trajectories: NDArray[np.float64],
    *,
    window: int = 5,
) -> NDArray[np.float64]:
    """Apply a simple moving average over time for each landmark coordinate."""

    if window <= 1:
        return trajectories

    t_len = trajectories.shape[0]
    radius = window // 2

    smoothed = np.zeros_like(trajectories)

    for t in range(t_len):
        start = max(0, t - radius)
        end = min(t_len, t + radius + 1)
        smoothed[t] = trajectories[start:end].mean(axis=0)

    return smoothed


def aggregate_landmarks(trajectories: NDArray[np.float64]) -> NDArray[np.float64]:
    """Aggregate smoothed landmarks into a single set of 21 points."""

    return trajectories.mean(axis=0)


def normalize_landmarks(points: NDArray[np.float64]) -> NDArray[np.float64]:
    """Normalize landmarks into a stable model space.

    - translate: wrist landmark (0) becomes the origin
    - scale: max distance from origin becomes 1.0
    """

    if points.shape != (HAND_LANDMARK_COUNT, 3):
        raise ValueError(f"Expected points shape (21, 3), got {points.shape}")

    translated = points - points[0]
    distances = np.linalg.norm(translated, axis=1)
    scale = float(distances.max())
    if scale <= 0.0:
        return translated

    return translated / scale


def _distance(a: NDArray[np.float64], b: NDArray[np.float64]) -> float:
    return float(np.linalg.norm(a - b))


def compute_finger_lengths(points: NDArray[np.float64]) -> dict[str, float]:
    lengths: dict[str, float] = {}
    for finger, idxs in FINGER_LANDMARKS.items():
        length = 0.0
        for a, b in zip(idxs[:-1], idxs[1:], strict=True):
            length += _distance(points[a], points[b])
        lengths[finger] = length
    return lengths


def _angle_degrees(
    a: NDArray[np.float64], b: NDArray[np.float64], c: NDArray[np.float64]
) -> float:
    ba = a - b
    bc = c - b
    ba_norm = float(np.linalg.norm(ba))
    bc_norm = float(np.linalg.norm(bc))
    if ba_norm == 0.0 or bc_norm == 0.0:
        return 0.0

    cos_angle = float(np.clip(np.dot(ba, bc) / (ba_norm * bc_norm), -1.0, 1.0))
    return math.degrees(math.acos(cos_angle))


def compute_articulation_degrees(points: NDArray[np.float64]) -> dict[str, dict[str, float]]:
    angles: dict[str, dict[str, float]] = {}

    for finger, joints in JOINTS_BY_FINGER.items():
        finger_angles: dict[str, float] = {}

        if finger == "thumb":
            mcp = joints["mcp"]
            ip = joints["ip"]
            tip = joints["tip"]
            finger_angles["mcp"] = _angle_degrees(points[0], points[mcp], points[ip])
            finger_angles["ip"] = _angle_degrees(points[mcp], points[ip], points[tip])
        else:
            mcp = joints["mcp"]
            pip = joints["pip"]
            dip = joints["dip"]
            tip = joints["tip"]
            finger_angles["mcp"] = _angle_degrees(points[0], points[mcp], points[pip])
            finger_angles["pip"] = _angle_degrees(points[mcp], points[pip], points[dip])
            finger_angles["dip"] = _angle_degrees(points[pip], points[dip], points[tip])

        angles[finger] = finger_angles

    return angles


def compute_metadata(points: NDArray[np.float64]) -> HandMeshMetadata:
    landmarks = [HandLandmark(x=float(p[0]), y=float(p[1]), z=float(p[2])) for p in points]

    fingertips = {
        finger: HandLandmark(
            x=float(points[idx, 0]),
            y=float(points[idx, 1]),
            z=float(points[idx, 2]),
        )
        for finger, idx in FINGERTIP_INDEX.items()
    }

    joints: dict[str, dict[str, HandLandmark]] = {}
    for finger, mapping in JOINTS_BY_FINGER.items():
        joints[finger] = {
            name: HandLandmark(
                x=float(points[idx, 0]),
                y=float(points[idx, 1]),
                z=float(points[idx, 2]),
            )
            for name, idx in mapping.items()
        }

    return HandMeshMetadata(
        landmarks=landmarks,
        fingertips=fingertips,
        joints=joints,
        finger_lengths=compute_finger_lengths(points),
        articulation_degrees=compute_articulation_degrees(points),
    )
