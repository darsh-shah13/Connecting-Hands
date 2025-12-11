"""Hand scan endpoint tests."""

import io
import json
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Create a test client."""
    return TestClient(app)


def test_submit_hand_scan_success(client: TestClient) -> None:
    """Test successful hand scan submission."""
    # Create mock image data
    image_data = io.BytesIO(b"fake image data")

    metadata = {
        "camera_type": "back",
        "zoom": 1.0,
        "flash_mode": "off",
    }

    files = [
        ("frames", ("frame1.jpg", image_data, "image/jpeg")),
        ("frames", ("frame2.jpg", io.BytesIO(b"fake image 2"), "image/jpeg")),
        ("frames", ("frame3.jpg", io.BytesIO(b"fake image 3"), "image/jpeg")),
    ]

    data = {
        "metadata": json.dumps(metadata),
        "timestamp": "1702000000000",
    }

    response = client.post(
        "/api/hands/scan",
        files=files,
        data=data,
    )

    assert response.status_code == 200
    result = response.json()
    assert result["success"] is True
    assert "scan_id" in result
    assert result["scan_id"].startswith("scan_")
    assert "landmarks" in result
    assert result["message"] == "Hand scan submitted successfully"


def test_submit_hand_scan_no_frames(client: TestClient) -> None:
    """Test hand scan submission without frames."""
    metadata = {
        "camera_type": "back",
        "zoom": 1.0,
        "flash_mode": "off",
    }

    data = {
        "metadata": json.dumps(metadata),
        "timestamp": "1702000000000",
    }

    response = client.post(
        "/api/hands/scan",
        files=[],
        data=data,
    )

    assert response.status_code == 400
    assert "No frames provided" in response.text


def test_submit_hand_scan_insufficient_frames(
    client: TestClient,
) -> None:
    """Test hand scan submission with less than 3 frames."""
    metadata = {
        "camera_type": "back",
        "zoom": 1.0,
        "flash_mode": "off",
    }

    files = [
        ("frames", ("frame1.jpg", io.BytesIO(b"fake image 1"), "image/jpeg")),
        ("frames", ("frame2.jpg", io.BytesIO(b"fake image 2"), "image/jpeg")),
    ]

    data = {
        "metadata": json.dumps(metadata),
        "timestamp": "1702000000000",
    }

    response = client.post(
        "/api/hands/scan",
        files=files,
        data=data,
    )

    assert response.status_code == 400
    assert "At least 3 frames required" in response.text


def test_submit_hand_scan_invalid_metadata(client: TestClient) -> None:
    """Test hand scan submission with invalid metadata."""
    files = [
        ("frames", ("frame1.jpg", io.BytesIO(b"fake image 1"), "image/jpeg")),
        ("frames", ("frame2.jpg", io.BytesIO(b"fake image 2"), "image/jpeg")),
        ("frames", ("frame3.jpg", io.BytesIO(b"fake image 3"), "image/jpeg")),
    ]

    data = {
        "metadata": "invalid json",
        "timestamp": "1702000000000",
    }

    response = client.post(
        "/api/hands/scan",
        files=files,
        data=data,
    )

    assert response.status_code == 400
    assert "Invalid metadata format" in response.text


def test_submit_hand_scan_with_many_frames(client: TestClient) -> None:
    """Test hand scan submission with many frames."""
    metadata = {
        "camera_type": "back",
        "zoom": 1.5,
        "flash_mode": "on",
    }

    files = [
        ("frames", (f"frame{i}.jpg", io.BytesIO(b"fake image"), "image/jpeg"))
        for i in range(10)
    ]

    data = {
        "metadata": json.dumps(metadata),
        "timestamp": "1702000000000",
    }

    response = client.post(
        "/api/hands/scan",
        files=files,
        data=data,
    )

    assert response.status_code == 200
    result = response.json()
    assert result["success"] is True
    assert len(result["landmarks"]) > 0


def test_detect_hand_landmarks_success(client: TestClient) -> None:
    """Test successful landmark detection."""
    image_data = io.BytesIO(b"fake image data")

    files = [
        ("frame", ("frame.jpg", image_data, "image/jpeg")),
    ]

    response = client.post(
        "/api/hands/detect",
        files=files,
    )

    assert response.status_code == 200
    result = response.json()
    assert "landmarks" in result
    assert isinstance(result["landmarks"], list)
    assert len(result["landmarks"]) > 0

    # Check landmark structure
    for landmark in result["landmarks"]:
        assert "x" in landmark
        assert "y" in landmark
        assert "z" in landmark
        assert "confidence" in landmark
        assert 0 <= landmark["x"] <= 1
        assert 0 <= landmark["y"] <= 1
        assert -1 <= landmark["z"] <= 1
        assert 0 <= landmark["confidence"] <= 1


def test_detect_hand_landmarks_no_frame(client: TestClient) -> None:
    """Test landmark detection without frame."""
    response = client.post(
        "/api/hands/detect",
        files=[],
    )

    assert response.status_code == 422 or response.status_code == 400


def test_scan_id_uniqueness(client: TestClient) -> None:
    """Test that each scan gets a unique ID."""
    metadata = {
        "camera_type": "back",
        "zoom": 1.0,
        "flash_mode": "off",
    }

    scan_ids = set()

    for _ in range(5):
        files = [
            ("frames", ("frame1.jpg", io.BytesIO(b"fake"), "image/jpeg")),
            ("frames", ("frame2.jpg", io.BytesIO(b"fake"), "image/jpeg")),
            ("frames", ("frame3.jpg", io.BytesIO(b"fake"), "image/jpeg")),
        ]

        data = {
            "metadata": json.dumps(metadata),
            "timestamp": str(int(__import__("time").time() * 1000)),
        }

        response = client.post(
            "/api/hands/scan",
            files=files,
            data=data,
        )

        assert response.status_code == 200
        result = response.json()
        scan_ids.add(result["scan_id"])

    # All scan IDs should be unique
    assert len(scan_ids) == 5
