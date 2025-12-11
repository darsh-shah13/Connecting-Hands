"""Lightweight file-backed job store.

This service is currently designed to run as a single-process FastAPI app. Jobs are
persisted to disk so that results can be fetched later without an external database.

If the project adopts Celery/Redis or a DB-backed queue, this module can be replaced
behind the same interface.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, cast

from pydantic import BaseModel, Field

JobStatus = Literal["queued", "processing", "completed", "failed"]


def utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


class HandScanJobRecord(BaseModel):
    job_id: str
    status: JobStatus = "queued"

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    frame_files: list[str] = Field(default_factory=list)

    metadata_file: str | None = None
    glb_file: str | None = None

    error: str | None = None


def get_job_dir(jobs_dir: Path, job_id: str) -> Path:
    return jobs_dir / job_id


def get_job_record_path(jobs_dir: Path, job_id: str) -> Path:
    return get_job_dir(jobs_dir, job_id) / "job.json"


def write_job_record(jobs_dir: Path, record: HandScanJobRecord) -> None:
    job_dir = get_job_dir(jobs_dir, record.job_id)
    job_dir.mkdir(parents=True, exist_ok=True)

    path = get_job_record_path(jobs_dir, record.job_id)
    tmp_path = path.with_suffix(".json.tmp")
    tmp_path.write_text(record.model_dump_json(indent=2), encoding="utf-8")
    tmp_path.replace(path)


def read_job_record(jobs_dir: Path, job_id: str) -> HandScanJobRecord | None:
    path = get_job_record_path(jobs_dir, job_id)
    if not path.exists():
        return None

    return HandScanJobRecord.model_validate_json(path.read_text(encoding="utf-8"))


def create_job(jobs_dir: Path, job_id: str, frame_files: list[str]) -> HandScanJobRecord:
    record = HandScanJobRecord(
        job_id=job_id,
        status="queued",
        frame_files=frame_files,
    )
    write_job_record(jobs_dir, record)
    return record


def update_job(
    jobs_dir: Path,
    job_id: str,
    *,
    status: JobStatus | None = None,
    metadata_file: str | None = None,
    glb_file: str | None = None,
    error: str | None = None,
) -> HandScanJobRecord:
    record = read_job_record(jobs_dir, job_id)
    if record is None:
        record = HandScanJobRecord(job_id=job_id)

    if status is not None:
        record.status = status
    if metadata_file is not None:
        record.metadata_file = metadata_file
    if glb_file is not None:
        record.glb_file = glb_file
    if error is not None:
        record.error = error

    record.updated_at = utc_now()

    write_job_record(jobs_dir, record)
    return record


def write_metadata(jobs_dir: Path, job_id: str, metadata_json: str) -> str:
    job_dir = get_job_dir(jobs_dir, job_id)
    job_dir.mkdir(parents=True, exist_ok=True)

    metadata_path = job_dir / "metadata.json"
    metadata_path.write_text(metadata_json, encoding="utf-8")
    return metadata_path.name


def read_metadata(jobs_dir: Path, job_id: str) -> dict[str, object] | None:
    record = read_job_record(jobs_dir, job_id)
    if record is None or record.metadata_file is None:
        return None

    path = Path(record.metadata_file)
    if not path.is_absolute():
        path = get_job_dir(jobs_dir, job_id) / path
    if not path.exists():
        return None

    data = json.loads(path.read_text(encoding="utf-8"))
    return cast(dict[str, object], data)


def write_glb(jobs_dir: Path, job_id: str, glb: bytes) -> str:
    job_dir = get_job_dir(jobs_dir, job_id)
    job_dir.mkdir(parents=True, exist_ok=True)

    glb_path = job_dir / "hand.glb"
    glb_path.write_bytes(glb)
    return glb_path.name


def read_glb(jobs_dir: Path, job_id: str) -> bytes | None:
    record = read_job_record(jobs_dir, job_id)
    if record is None or record.glb_file is None:
        return None

    path = Path(record.glb_file)
    if not path.is_absolute():
        path = get_job_dir(jobs_dir, job_id) / path
    if not path.exists():
        return None

    return path.read_bytes()
