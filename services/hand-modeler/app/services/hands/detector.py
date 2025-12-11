"""Landmark detection abstraction.

The production implementation uses MediaPipe Hands when installed. Tests can inject a
fake detector to avoid the heavy vision dependency.
"""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from typing import Protocol


@dataclass(frozen=True, slots=True)
class Landmark:
    x: float
    y: float
    z: float
    confidence: float | None = None


class LandmarkDetector(Protocol):
    def detect(self, image_bytes: bytes) -> list[Landmark]:
        ...


class UnavailableLandmarkDetector:
    def __init__(self, message: str) -> None:
        self._message = message

    def detect(self, image_bytes: bytes) -> list[Landmark]:
        raise RuntimeError(self._message)


class MediapipeHandsDetector:
    def __init__(
        self,
        *,
        static_image_mode: bool = True,
        max_num_hands: int = 1,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
    ) -> None:
        try:
            import mediapipe as mp  # type: ignore[import-untyped]
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "mediapipe is not installed. Install with: poetry add mediapipe"
            ) from exc

        self._mp = mp
        self._hands = mp.solutions.hands.Hands(
            static_image_mode=static_image_mode,
            max_num_hands=max_num_hands,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

    def detect(self, image_bytes: bytes) -> list[Landmark]:
        from PIL import Image  # type: ignore[import-untyped]
        import numpy as np

        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        image = np.asarray(img)

        result = self._hands.process(image)
        if not result.multi_hand_landmarks:
            return []

        hand = result.multi_hand_landmarks[0]

        landmarks: list[Landmark] = []
        for lm in hand.landmark:
            confidence: float | None = None
            if hasattr(lm, "presence") and lm.presence is not None:
                confidence = float(lm.presence)
            elif hasattr(lm, "visibility") and lm.visibility is not None:
                confidence = float(lm.visibility)

            landmarks.append(
                Landmark(
                    x=float(lm.x),
                    y=float(lm.y),
                    z=float(lm.z),
                    confidence=confidence,
                )
            )

        return landmarks
