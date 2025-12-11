"""End-to-end sharing flow tests."""

from __future__ import annotations

import base64

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Create a test client."""

    return TestClient(app)


def test_pairing_and_model_sharing_flow(client: TestClient) -> None:
    """Two users can pair, upload a model, and the partner can retrieve it."""

    user_a = client.post("/api/users", json={"display_name": "Alice"}).json()
    user_b = client.post("/api/users", json={"display_name": "Bob"}).json()

    session = client.post("/api/sessions", json={"inviter_user_id": user_a["id"]}).json()

    joined = client.post(
        "/api/sessions/join",
        json={"share_code": session["share_code"], "partner_user_id": user_b["id"]},
    ).json()
    assert joined["partner_user_id"] == user_b["id"]

    model_bytes = b"glb-test-bytes"
    model_b64 = base64.b64encode(model_bytes).decode("ascii")

    uploaded = client.post(
        f"/api/sessions/{session['id']}/hand-models/base64",
        json={"owner_user_id": user_a["id"], "glb_base64": model_b64},
    ).json()
    assert uploaded["session_id"] == session["id"]
    assert uploaded["download_url"]

    polled = client.get(f"/api/sessions/{session['id']}/poll").json()
    assert polled["has_new_model"] is True
    assert polled["latest_model"]["id"] == uploaded["id"]

    meta = client.get(
        f"/api/hand-models/{uploaded['id']}", params={"viewer_user_id": user_b["id"]}
    ).json()
    assert meta["retrieved_at"] is not None

    confirmed = client.post(
        f"/api/hand-models/{uploaded['id']}/confirm",
        data={"partner_user_id": user_b["id"]},
    ).json()
    assert confirmed["confirmed_at"] is not None

    download_url = meta["download_url"]
    path = download_url.replace("http://testserver", "")
    content = client.get(path).content
    assert content == model_bytes
