"""API tests for scan ingestion and result retrieval."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image  # type: ignore[import-untyped]

from app.config import settings
from app.main import app
from app.routers.hands import get_landmark_detector
from app.services.hands.detector import Landmark, LandmarkDetector


class FakeDetector(LandmarkDetector):
    def __init__(self) -> None:
        points = np.array(
            [[(i - 10) * 0.01, (i % 5) * 0.02, (i % 3) * 0.015] for i in range(21)],
            dtype=np.float64,
        )
        self._landmarks = [Landmark(x=float(x), y=float(y), z=float(z)) for x, y, z in points]

    def detect(self, image_bytes: bytes) -> list[Landmark]:
        return list(self._landmarks)


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    settings.jobs_dir = str(tmp_path / "jobs")

    app.dependency_overrides[get_landmark_detector] = lambda: FakeDetector()

    test_client = TestClient(app)
    yield test_client

    app.dependency_overrides.clear()


def _png_bytes(color: tuple[int, int, int]) -> bytes:
    img = Image.new("RGB", (32, 32), color=color)
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_scan_endpoint_creates_and_processes_job(client: TestClient) -> None:
    files = [
        ("frames", ("frame1.png", _png_bytes((255, 0, 0)), "image/png")),
        ("frames", ("frame2.png", _png_bytes((0, 255, 0)), "image/png")),
    ]

    response = client.post("/api/hands/scan", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data

    job_id = data["job_id"]

    status_response = client.get(f"/api/hands/{job_id}")
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["status"] == "completed"
    assert status_data["metadata"] is not None
    assert status_data["glb_base64"] is not None
