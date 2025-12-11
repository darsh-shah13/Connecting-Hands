"""Unit tests for landmark smoothing/normalization and metadata."""

from __future__ import annotations

import numpy as np

from app.services.hands.detector import Landmark
from app.services.hands.processing import (
    HAND_LANDMARK_COUNT,
    aggregate_landmarks,
    compute_metadata,
    landmarks_to_array,
    normalize_landmarks,
    smooth_trajectories,
)


def _make_frame(offset: float) -> list[Landmark]:
    return [
        Landmark(x=offset + i * 0.01, y=0.25 + i * 0.005, z=-0.1 + i * 0.002)
        for i in range(HAND_LANDMARK_COUNT)
    ]


def test_landmark_parsing_smoothing_and_normalization() -> None:
    frames = [_make_frame(0.0), _make_frame(0.1), _make_frame(0.2)]

    trajectories = landmarks_to_array(frames)
    assert trajectories.shape == (3, HAND_LANDMARK_COUNT, 3)

    smoothed = smooth_trajectories(trajectories, window=3)
    assert smoothed.shape == trajectories.shape

    # Middle timestamp should equal mean of all three
    expected = trajectories.mean(axis=0)
    assert np.allclose(smoothed[1], expected)

    points = aggregate_landmarks(smoothed)
    assert points.shape == (HAND_LANDMARK_COUNT, 3)

    normalized = normalize_landmarks(points)
    assert np.allclose(normalized[0], np.zeros(3))

    max_dist = float(np.linalg.norm(normalized, axis=1).max())
    assert np.isclose(max_dist, 1.0)

    metadata = compute_metadata(normalized)
    assert len(metadata.landmarks) == HAND_LANDMARK_COUNT
    assert set(metadata.finger_lengths.keys()) == {"thumb", "index", "middle", "ring", "pinky"}
    assert set(metadata.fingertips.keys()) == {"thumb", "index", "middle", "ring", "pinky"}
