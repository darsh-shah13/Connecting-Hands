"""Object storage router (signed download URLs)."""

from __future__ import annotations

from fastapi import APIRouter, Query
from starlette.responses import FileResponse

from app.storage import file_path_for_key, verify_storage_signature

router = APIRouter()


@router.get("/storage/download", name="storage_download")
async def download(
    key: str = Query(...),
    expires: int = Query(...),
    sig: str = Query(...),
) -> FileResponse:
    """Download a file from local object storage via a signed URL."""

    verify_storage_signature(key=key, expires=expires, sig=sig)
    path = file_path_for_key(key)

    return FileResponse(path)
