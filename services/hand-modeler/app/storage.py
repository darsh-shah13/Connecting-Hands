"""Local object storage + signed URL helpers.

We store GLB files on local disk (or any mounted volume) and provide signed URLs
that map to a download endpoint.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import time
from pathlib import Path
from urllib.parse import urlencode

from fastapi import HTTPException, UploadFile
from starlette.requests import Request

from app.config import settings


def _hmac_sha256_hex(secret: str, message: str) -> str:
    return hmac.new(secret.encode("utf-8"), message.encode("utf-8"), hashlib.sha256).hexdigest()


def sign_storage_key(*, key: str, expires: int) -> str:
    """Create an HMAC signature for a storage key and expiry timestamp."""

    payload = f"{key}:{expires}"
    return _hmac_sha256_hex(settings.storage_signing_secret, payload)


def verify_storage_signature(*, key: str, expires: int, sig: str) -> None:
    """Validate expiry and signature.

    Raises:
        HTTPException: if the signature is invalid or expired.
    """

    if int(time.time()) > expires:
        raise HTTPException(status_code=403, detail="Signed URL has expired")

    expected = sign_storage_key(key=key, expires=expires)
    if not hmac.compare_digest(expected, sig):
        raise HTTPException(status_code=403, detail="Invalid signed URL")


def storage_dir() -> Path:
    return Path(settings.storage_dir)


def _safe_path_for_key(key: str) -> Path:
    base = storage_dir().resolve()

    if key.startswith("/") or ".." in key.split("/"):
        raise HTTPException(status_code=400, detail="Invalid storage key")

    path = (base / key).resolve()
    if base not in path.parents and path != base:
        raise HTTPException(status_code=400, detail="Invalid storage key")

    return path


def ensure_storage_dirs() -> None:
    """Ensure that storage + data directories exist."""

    storage_dir().mkdir(parents=True, exist_ok=True)


def save_upload_file(*, key: str, upload: UploadFile, max_size_bytes: int) -> int:
    """Persist an UploadFile to storage.

    Returns:
        Saved file size in bytes.
    """

    dest_path = _safe_path_for_key(key)
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    size = 0
    with dest_path.open("wb") as f:
        while True:
            chunk = upload.file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > max_size_bytes:
                f.close()
                try:
                    dest_path.unlink(missing_ok=True)
                except OSError:
                    pass
                raise HTTPException(status_code=413, detail="Model file too large")
            f.write(chunk)

    return size


def save_base64_bytes(*, key: str, data_base64: str, max_size_bytes: int) -> int:
    """Persist base64-encoded bytes to storage."""

    try:
        raw = base64.b64decode(data_base64, validate=True)
    except ValueError as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail="Invalid base64 payload") from exc

    if len(raw) > max_size_bytes:
        raise HTTPException(status_code=413, detail="Model file too large")

    dest_path = _safe_path_for_key(key)
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    dest_path.write_bytes(raw)
    return len(raw)


def generate_signed_download_url(*, request: Request, key: str) -> str:
    """Generate a signed download URL for a storage key."""

    expires = int(time.time()) + settings.signed_url_ttl_seconds
    sig = sign_storage_key(key=key, expires=expires)

    base_url = str(request.url_for("storage_download"))
    return f"{base_url}?{urlencode({'key': key, 'expires': expires, 'sig': sig})}"


def file_exists(key: str) -> bool:
    return _safe_path_for_key(key).exists()


def file_path_for_key(key: str) -> Path:
    path = _safe_path_for_key(key)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return path
